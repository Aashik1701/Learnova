"""
Certificate issuance pipeline service.
Orchestrates the entire certificate generation, IPFS pinning, and blockchain anchoring flow.
"""

import os
import logging
import tempfile
from datetime import datetime
from typing import Dict, Any, Optional
from dotenv import load_dotenv

# Ensure environment variables are loaded
load_dotenv()

from app.services.certificate_generator import CertificateGenerator
from app.services.proof_generator import ProofGenerator
from app.services.pinata_service import PinataService
from app.services.blockchain_service import BlockchainService
from app.services.db_service import DatabaseService
from app.services.email_service import EmailService

logger = logging.getLogger(__name__)

class CertificatePipeline:
    """Main pipeline for certificate issuance."""
    
    def __init__(self):
        """Initialize all service dependencies."""
        self.cert_generator = CertificateGenerator()
        self.proof_generator = ProofGenerator()
        # Initialize services lazily to avoid errors if env vars are missing
        self._pinata = None
        self._blockchain = None
        self._db = None
        self._email = None
    
    @property
    def pinata(self):
        """Lazy initialization of Pinata service."""
        if self._pinata is None:
            try:
                self._pinata = PinataService()
            except Exception as e:
                raise Exception(f"Pinata service not configured: {str(e)}")
        return self._pinata
    
    @property
    def blockchain(self):
        """Lazy initialization of Blockchain service."""
        if self._blockchain is None:
            try:
                self._blockchain = BlockchainService()
            except Exception as e:
                raise Exception(f"Blockchain service not configured: {str(e)}")
        return self._blockchain
    
    @property
    def db(self):
        """Lazy initialization of Database service."""
        if self._db is None:
            try:
                self._db = DatabaseService()
            except Exception as e:
                raise Exception(f"Database service not configured: {str(e)}")
        return self._db
    
    @property
    def email(self):
        """Lazy initialization of Email service."""
        if self._email is None:
            self._email = EmailService()
        return self._email
    
    async def issue_certificate(
        self,
        user_id: str,
        course_id: str,
        course_name: str,
        learner_name: str,
        grade: str,
        duration_hours: float,
        modules: int,
        metadata: Optional[Dict[str, Any]] = None,
        owner_address: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Complete certificate issuance pipeline.
        
        Steps:
        1. Generate certificate ID and canonical JSON
        2. Render PDF from canonical data
        3. Pin PDF to IPFS (Pinata)
        4. Store CID on blockchain via smart contract
        5. Generate proof page (HTML + PDF)
        6. Pin proof page to IPFS (optional)
        7. Save record to database
        8. Send verification email to learner
        
        Args:
            user_id: User UUID
            course_id: Course UUID
            course_name: Course name
            learner_name: Learner full name
            grade: Pass/Distinction or score
            duration_hours: Course duration in hours
            modules: Number of modules completed
            metadata: Additional metadata
            owner_address: Optional owner wallet address
            
        Returns:
            Dict with certificate details and status
        """
        cert_id = None
        status = "pending"
        error_message = None
        
        try:
            # Check if certificate already exists (idempotency) - optional if DB not configured
            try:
                existing = await self.db.get_certificate_by_user_course(user_id, course_id)
                if existing and existing.get('status') == 'issued':
                    logger.info(f"Certificate already exists for user {user_id}, course {course_id}")
                    # Return existing certificate data
                    gateway_url = None
                    cid_doc = existing.get('cid_doc')
                    if cid_doc and not cid_doc.startswith('local://'):
                        if cid_doc.startswith('ipfs://'):
                            cid = cid_doc.replace('ipfs://', '')
                        else:
                            cid = cid_doc
                        gateway_url = f"{os.getenv('IPFS_GATEWAY_BASE', 'https://ipfs.io/ipfs/')}{cid}"
                    
                    verify_url = f"{os.getenv('VERIFY_BASE_URL', 'http://localhost:5173/verify')}?certId={existing['cert_id']}"
                    proof_url = f"{os.getenv('IPFS_GATEWAY_BASE', 'https://ipfs.io/ipfs/')}{existing.get('cid_proof')}" if existing.get('cid_proof') else verify_url
                    
                    return {
                        'status': 'already_issued',
                        'cert_id': existing['cert_id'],
                        'cid_doc': cid_doc,
                        'cid_proof': existing.get('cid_proof'),
                        'tx_hash': existing.get('tx_hash'),
                        'gateway_url': gateway_url,
                        'verify_url': verify_url,
                        'proof_url': proof_url,
                        'issued_on': existing.get('issued_on'),
                        'message': 'Certificate already issued'
                    }
            except Exception as db_check_error:
                logger.warning(f"Could not check existing certificates (DB not available): {db_check_error}")
            
            # Step 1: Generate certificate ID and canonical JSON
            logger.info(f"Generating certificate for user {user_id}, course {course_id}")
            cert_id = self.cert_generator.generate_cert_id()
            issued_on = datetime.now()
            
            # Get issuer address (use default if blockchain not configured)
            try:
                issuer_address = self.blockchain.issuer_address
            except Exception as bc_error:
                issuer_address = os.getenv("ISSUER_ADDRESS", "0x0000000000000000000000000000000000000000")
                logger.warning(f"Using default issuer address (blockchain not configured: {bc_error})")
            
            canonical_json = self.cert_generator.create_canonical_json(
                cert_id=cert_id,
                name=learner_name,
                learner_id=user_id,
                course_id=course_id,
                course_name=course_name,
                issued_on=issued_on,
                issuer_address=issuer_address,
                grade=grade,
                duration_hours=duration_hours,
                modules=modules,
                metadata=metadata
            )
            
            # Step 2: Render PDF
            cert_pdf_path = None
            proof_html_path = None
            proof_pdf_path = None
            
            try:
                with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as cert_pdf:
                    cert_pdf_path = cert_pdf.name
                    self.cert_generator.render_pdf(canonical_json, cert_pdf_path)
                
                # Step 3: Pin certificate PDF to IPFS (required for Pinata)
                cid_doc = None
                try:
                    logger.info(f"Pinning certificate PDF to IPFS via Pinata...")
                    pin_result = self.pinata.pin_file(cert_pdf_path, f"{cert_id}.pdf")
                    cid_doc = pin_result['cid']
                    logger.info(f"✓ Certificate PDF pinned to IPFS. CID: {cid_doc}")
                except Exception as pinata_error:
                    error_msg = str(pinata_error)
                    logger.error(f"✗ IPFS pinning failed: {error_msg}")
                    # Check if it's a configuration error
                    if "PINATA_JWT" in error_msg or "PINATA_API_KEY" in error_msg:
                        logger.error("Pinata credentials not configured. Please add PINATA_JWT to backend/.env")
                    raise Exception(f"Failed to upload certificate to IPFS: {error_msg}. Please configure PINATA_JWT in backend/.env")
                
                # Step 4: Store on blockchain (optional - skip if not configured)
                tx_hash = None
                try:
                    logger.info(f"Storing certificate on blockchain...")
                    tx_result = self.blockchain.store_certificate(
                        cert_id=cert_id,
                        cid=cid_doc or f"local-{cert_id}",
                        owner_address=owner_address
                    )
                    tx_hash = tx_result.get('tx_hash')
                    
                    if tx_result.get('status') == 'already_stored':
                        logger.info("Certificate already stored on-chain")
                        tx_hash = None
                    else:
                        logger.info(f"Certificate stored on-chain. TX: {tx_hash}")
                except Exception as blockchain_error:
                    logger.warning(f"Blockchain storage not available: {blockchain_error}. Continuing without blockchain...")
                
                # Step 5: Generate proof page
                logger.info("Generating proof page...")
                proof_html = self.proof_generator.generate_html_proof_page(
                    cert_id=cert_id,
                    learner_name=learner_name,
                    course_name=course_name,
                    issued_on=issued_on.isoformat(),
                    cid_doc=cid_doc,
                    tx_hash=tx_hash
                )
                
                # Save proof HTML
                with tempfile.NamedTemporaryFile(mode='w', suffix='.html', delete=False) as proof_html_file:
                    proof_html_path = proof_html_file.name
                    proof_html_file.write(proof_html)
                
                # Generate proof PDF (optional - skip if fails)
                try:
                    with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as proof_pdf:
                        proof_pdf_path = proof_pdf.name
                        self.proof_generator.generate_pdf_proof_page(
                            cert_id=cert_id,
                            learner_name=learner_name,
                            course_name=course_name,
                            issued_on=issued_on.isoformat(),
                            cid_doc=cid_doc,
                            tx_hash=tx_hash,
                            output_path=proof_pdf_path
                        )
                except Exception as pdf_error:
                    logger.warning(f"Failed to generate proof PDF (non-critical): {pdf_error}")
                    proof_pdf_path = None
                
                # Step 6: Pin proof page (optional)
                cid_proof = None
                try:
                    logger.info("Pinning proof page to IPFS...")
                    proof_pin_result = self.pinata.pin_file(proof_html_path, f"{cert_id}_proof.html")
                    cid_proof = proof_pin_result['cid']
                    logger.info(f"Proof page pinned. CID: {cid_proof}")
                except Exception as e:
                    logger.warning(f"Failed to pin proof page (non-critical): {str(e)}")
                
                # Step 7: Save to database (optional - skip if not configured)
                try:
                    logger.info("Saving certificate record to database...")
                    cert_record = {
                        'cert_id': cert_id,
                        'user_id': user_id,
                        'course_id': course_id,
                        'cid_doc': cid_doc,
                        'cid_proof': cid_proof,
                        'tx_hash': tx_hash,
                        'issuer_addr': issuer_address or "not-configured",
                        'issued_on': issued_on,
                        'revoked': False,
                        'status': 'issued',
                        'meta': metadata or {}
                    }
                    
                    await self.db.save_certificate(cert_record)
                    logger.info("Certificate record saved to database")
                except Exception as db_error:
                    logger.warning(f"Database not available: {db_error}. Continuing without database storage...")
                
                # Step 8: Send verification email (optional)
                try:
                    verify_url = f"{os.getenv('VERIFY_BASE_URL', 'http://localhost:5173/verify')}?certId={cert_id}"
                    proof_url = f"{os.getenv('IPFS_GATEWAY_BASE', 'https://ipfs.io/ipfs/')}{cid_proof}" if cid_proof else verify_url
                    
                    await self.email.send_certificate_email(
                        recipient_email=None,  # Will need to fetch from user profile
                        recipient_name=learner_name,
                        cert_id=cert_id,
                        course_name=course_name,
                        verify_url=verify_url,
                        proof_url=proof_url,
                        tx_hash=tx_hash,
                        cid_doc=cid_doc
                    )
                    logger.info("Verification email sent")
                except Exception as e:
                    logger.warning(f"Failed to send email (non-critical): {str(e)}")
                
                status = "issued"
                
                # Build IPFS gateway URL for easy access
                gateway_url = None
                if cid_doc:
                    if cid_doc.startswith('local://'):
                        # If Pinata failed, still generate a readable URL format
                        gateway_url = None  # No gateway URL for local files
                    elif cid_doc.startswith('ipfs://'):
                        cid = cid_doc.replace('ipfs://', '')
                        gateway_url = f"{os.getenv('IPFS_GATEWAY_BASE', 'https://ipfs.io/ipfs/')}{cid}"
                    elif cid_doc.startswith('http'):
                        gateway_url = cid_doc  # Already a full URL
                    else:
                        # It's a CID - format as gateway URL
                        gateway_url = f"{os.getenv('IPFS_GATEWAY_BASE', 'https://ipfs.io/ipfs/')}{cid_doc}"
                
                return {
                    'status': 'success',
                    'cert_id': cert_id,
                    'cid_doc': cid_doc,
                    'cid_proof': cid_proof,
                    'tx_hash': tx_hash,
                    'gateway_url': gateway_url,  # Direct IPFS gateway link
                    'verify_url': verify_url,
                    'proof_url': proof_url,
                    'issued_on': issued_on.isoformat()
                }
                
            finally:
                # Cleanup temporary files
                for path in [cert_pdf_path, proof_html_path]:
                    if path:
                        try:
                            if os.path.exists(path):
                                os.unlink(path)
                        except Exception as e:
                            logger.warning(f"Failed to cleanup {path}: {e}")
                if proof_pdf_path:
                    try:
                        if os.path.exists(proof_pdf_path):
                            os.unlink(proof_pdf_path)
                    except Exception as e:
                        logger.warning(f"Failed to cleanup proof PDF: {e}")
        
        except Exception as e:
            status = "failed"
            error_message = str(e)
            logger.error(f"Certificate issuance failed: {str(e)}", exc_info=True)
            
            # Save failed record to database for retry (optional - skip if DB not available)
            if cert_id:
                try:
                    issuer_addr = None
                    try:
                        issuer_addr = self.blockchain.issuer_address
                    except Exception:
                        issuer_addr = os.getenv("ISSUER_ADDRESS", "0x0000000000000000000000000000000000000000")
                    
                    await self.db.save_certificate({
                        'cert_id': cert_id,
                        'user_id': user_id,
                        'course_id': course_id,
                        'cid_doc': None,
                        'cid_proof': None,
                        'tx_hash': None,
                        'issuer_addr': issuer_addr,
                        'issued_on': datetime.now(),
                        'revoked': False,
                        'status': 'failed',
                        'meta': {'error': error_message, **(metadata or {})}
                    })
                except Exception as db_error:
                    logger.warning(f"Could not save failed certificate record (DB not available): {db_error}")
            
            return {
                'status': 'failed',
                'cert_id': cert_id,
                'error': error_message
            }
    
    async def verify_certificate(self, cert_id: str) -> Dict[str, Any]:
        """
        Verify a certificate by checking on-chain CID against database.
        
        Args:
            cert_id: Certificate ID to verify
            
        Returns:
            Verification result with status and details
        """
        try:
            # Get certificate from database
            cert_record = await self.db.get_certificate(cert_id)
            
            if not cert_record:
                return {
                    'verified': False,
                    'status': 'not_found',
                    'message': 'Certificate not found in database'
                }
            
            if cert_record.get('revoked'):
                return {
                    'verified': False,
                    'status': 'revoked',
                    'message': 'Certificate has been revoked'
                }
            
            db_cid = cert_record.get('cid_doc')
            if not db_cid:
                return {
                    'verified': False,
                    'status': 'incomplete',
                    'message': 'Certificate document not available'
                }
            
            # Check on-chain CID
            on_chain_cid = self.blockchain.get_certificate_cid(cert_id)
            
            if not on_chain_cid:
                return {
                    'verified': False,
                    'status': 'not_on_chain',
                    'message': 'Certificate not found on blockchain',
                    'db_cid': db_cid
                }
            
            # Compare CIDs
            verified = on_chain_cid.strip() == db_cid.strip()
            
            if verified:
                return {
                    'verified': True,
                    'status': 'verified',
                    'cert_id': cert_id,
                    'on_chain_cid': on_chain_cid,
                    'db_cid': db_cid,
                    'tx_hash': cert_record.get('tx_hash'),
                    'issued_on': cert_record.get('issued_on'),
                    'proof_url': f"{os.getenv('IPFS_GATEWAY_BASE', 'https://ipfs.io/ipfs/')}{db_cid}",
                    'verify_url': f"{os.getenv('VERIFY_BASE_URL', 'https://learnova.org/verify')}?certId={cert_id}"
                }
            else:
                return {
                    'verified': False,
                    'status': 'mismatch',
                    'message': 'CID mismatch between database and blockchain',
                    'on_chain_cid': on_chain_cid,
                    'db_cid': db_cid
                }
                
        except Exception as e:
            logger.error(f"Verification error: {str(e)}", exc_info=True)
            return {
                'verified': False,
                'status': 'error',
                'message': str(e)
            }

