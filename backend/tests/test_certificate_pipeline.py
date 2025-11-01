"""
Unit and integration tests for certificate issuance pipeline.
"""

import pytest
import os
import tempfile
from unittest.mock import Mock, patch, AsyncMock
from datetime import datetime
from app.services.certificate_pipeline import CertificatePipeline
from app.services.certificate_generator import CertificateGenerator
from app.services.proof_generator import ProofGenerator


class TestCertificateGenerator:
    """Test certificate generation."""
    
    def test_generate_cert_id(self):
        """Test certificate ID generation."""
        generator = CertificateGenerator()
        cert_id = generator.generate_cert_id()
        
        assert cert_id.startswith("LEARNOVA-")
        assert len(cert_id.split("-")) == 3
        year = datetime.now().year
        assert str(year) in cert_id
    
    def test_create_canonical_json(self):
        """Test canonical JSON creation."""
        generator = CertificateGenerator()
        
        cert_id = "LEARNOVA-2025-000001"
        issued_on = datetime.now()
        
        cert_json = generator.create_canonical_json(
            cert_id=cert_id,
            name="John Doe",
            learner_id="user-123",
            course_id="course-456",
            course_name="Test Course",
            issued_on=issued_on,
            issuer_address="0x1234567890abcdef",
            grade="Pass",
            duration_hours=10.0,
            modules=5,
            metadata={"language": "en"}
        )
        
        assert cert_json["certId"] == cert_id
        assert cert_json["name"] == "John Doe"
        assert cert_json["learnerId"] == "user-123"
        assert cert_json["courseId"] == "course-456"
        assert cert_json["courseName"] == "Test Course"
        assert cert_json["grade"] == "Pass"
        assert cert_json["durationHours"] == 10.0
        assert cert_json["modules"] == 5
        assert "cid_doc" not in cert_json  # Must not include CID
        assert "txHash" not in cert_json  # Must not include txHash
        
        # Verify canonical ordering (should be alphabetical within nested)
        keys = list(cert_json.keys())
        assert keys[0] == "certId"
        assert "metadata" in keys


@pytest.mark.asyncio
class TestCertificatePipeline:
    """Test certificate issuance pipeline."""
    
    @patch('app.services.certificate_pipeline.PinataService')
    @patch('app.services.certificate_pipeline.BlockchainService')
    @patch('app.services.certificate_pipeline.DatabaseService')
    @patch('app.services.certificate_pipeline.EmailService')
    async def test_issue_certificate_success(
        self,
        mock_email,
        mock_db,
        mock_blockchain,
        mock_pinata
    ):
        """Test successful certificate issuance."""
        # Setup mocks
        mock_pinata_instance = Mock()
        mock_pinata_instance.pin_file.return_value = {
            'cid': 'QmTest123',
            'gateway_url': 'https://ipfs.io/ipfs/QmTest123'
        }
        mock_pinata.return_value = mock_pinata_instance
        
        mock_blockchain_instance = Mock()
        mock_blockchain_instance.store_certificate.return_value = {
            'tx_hash': '0xabcdef123456',
            'status': 'confirmed'
        }
        mock_blockchain_instance.issuer_address = '0xIssuer123'
        mock_blockchain_instance.get_certificate_cid.return_value = None
        mock_blockchain.return_value = mock_blockchain_instance
        
        mock_db_instance = AsyncMock()
        mock_db_instance.get_certificate_by_user_course.return_value = None
        mock_db_instance.save_certificate.return_value = {'cert_id': 'LEARNOVA-2025-000001'}
        mock_db.return_value = mock_db_instance
        
        mock_email_instance = AsyncMock()
        mock_email_instance.send_certificate_email.return_value = True
        mock_email.return_value = mock_email_instance
        
        # Run pipeline
        pipeline = CertificatePipeline()
        result = await pipeline.issue_certificate(
            user_id="user-123",
            course_id="course-456",
            course_name="Test Course",
            learner_name="John Doe",
            grade="Pass",
            duration_hours=10.0,
            modules=5
        )
        
        # Assertions
        assert result['status'] == 'success'
        assert 'cert_id' in result
        assert result['cid_doc'] == 'QmTest123'
        assert result['tx_hash'] == '0xabcdef123456'
        
        # Verify mocks were called
        mock_pinata_instance.pin_file.assert_called()
        mock_blockchain_instance.store_certificate.assert_called()
        mock_db_instance.save_certificate.assert_called()
    
    @patch('app.services.certificate_pipeline.PinataService')
    @patch('app.services.certificate_pipeline.BlockchainService')
    @patch('app.services.certificate_pipeline.DatabaseService')
    async def test_issue_certificate_idempotency(
        self,
        mock_db,
        mock_blockchain,
        mock_pinata
    ):
        """Test idempotency - don't re-issue existing certificates."""
        mock_db_instance = AsyncMock()
        mock_db_instance.get_certificate_by_user_course.return_value = {
            'cert_id': 'LEARNOVA-2025-000001',
            'status': 'issued'
        }
        mock_db.return_value = mock_db_instance
        
        pipeline = CertificatePipeline()
        result = await pipeline.issue_certificate(
            user_id="user-123",
            course_id="course-456",
            course_name="Test Course",
            learner_name="John Doe",
            grade="Pass",
            duration_hours=10.0,
            modules=5
        )
        
        assert result['status'] == 'already_issued'
        assert result['cert_id'] == 'LEARNOVA-2025-000001'
    
    @patch('app.services.certificate_pipeline.BlockchainService')
    @patch('app.services.certificate_pipeline.DatabaseService')
    async def test_verify_certificate_success(
        self,
        mock_db,
        mock_blockchain
    ):
        """Test certificate verification."""
        mock_db_instance = AsyncMock()
        mock_db_instance.get_certificate.return_value = {
            'cert_id': 'LEARNOVA-2025-000001',
            'cid_doc': 'QmTest123',
            'tx_hash': '0xabcdef',
            'issued_on': datetime.now().isoformat(),
            'revoked': False
        }
        mock_db.return_value = mock_db_instance
        
        mock_blockchain_instance = Mock()
        mock_blockchain_instance.get_certificate_cid.return_value = 'QmTest123'
        mock_blockchain.return_value = mock_blockchain_instance
        
        pipeline = CertificatePipeline()
        result = await pipeline.verify_certificate('LEARNOVA-2025-000001')
        
        assert result['verified'] is True
        assert result['status'] == 'verified'
        assert result['on_chain_cid'] == 'QmTest123'
    
    @patch('app.services.certificate_pipeline.BlockchainService')
    @patch('app.services.certificate_pipeline.DatabaseService')
    async def test_verify_certificate_mismatch(
        self,
        mock_db,
        mock_blockchain
    ):
        """Test certificate verification with CID mismatch."""
        mock_db_instance = AsyncMock()
        mock_db_instance.get_certificate.return_value = {
            'cert_id': 'LEARNOVA-2025-000001',
            'cid_doc': 'QmTest123',
            'revoked': False
        }
        mock_db.return_value = mock_db_instance
        
        mock_blockchain_instance = Mock()
        mock_blockchain_instance.get_certificate_cid.return_value = 'QmDifferent456'
        mock_blockchain.return_value = mock_blockchain_instance
        
        pipeline = CertificatePipeline()
        result = await pipeline.verify_certificate('LEARNOVA-2025-000001')
        
        assert result['verified'] is False
        assert result['status'] == 'mismatch'


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

