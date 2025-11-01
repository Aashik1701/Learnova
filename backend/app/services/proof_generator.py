"""
Proof page generation service.
Creates human-readable HTML and PDF proof pages for certificate verification.
"""

import os
import logging
from typing import Dict, Any, Optional
from jinja2 import Template
import qrcode
from io import BytesIO
import base64

logger = logging.getLogger(__name__)

class ProofGenerator:
    """Service for generating proof pages (HTML/PDF) with verification information."""
    
    def __init__(self):
        """Initialize proof generator."""
        self.verify_base_url = os.getenv("VERIFY_BASE_URL", "https://learnova.org/verify")
        self.ipfs_gateway_base = os.getenv("IPFS_GATEWAY_BASE", "https://ipfs.io/ipfs/")
        self.contract_address = os.getenv("CONTRACT_ADDRESS", "")
        self.network_name = os.getenv("NETWORK_NAME", "Polygon Mumbai")
    
    def generate_qr_code(self, url: str) -> str:
        """
        Generate QR code as base64 data URI.
        
        Args:
            url: URL to encode in QR code
            
        Returns:
            Base64 data URI string
        """
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(url)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Convert to base64
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        img_str = base64.b64encode(buffer.getvalue()).decode()
        
        return f"data:image/png;base64,{img_str}"
    
    def generate_html_proof_page(
        self,
        cert_id: str,
        learner_name: str,
        course_name: str,
        issued_on: str,
        cid_doc: str,
        tx_hash: Optional[str] = None,
        cid_proof: Optional[str] = None
    ) -> str:
        """
        Generate HTML proof page.
        
        Args:
            cert_id: Certificate ID
            learner_name: Learner full name
            course_name: Course name
            issued_on: Issue date
            cid_doc: IPFS CID of certificate document
            tx_hash: Blockchain transaction hash
            cid_proof: IPFS CID of proof page (optional)
            
        Returns:
            HTML string
        """
        verify_url = f"{self.verify_base_url}?certId={cert_id}"
        ipfs_url = f"{self.ipfs_gateway_base}{cid_doc}"
        ipfs_protocol_url = f"ipfs://{cid_doc}"
        
        qr_code_data = self.generate_qr_code(verify_url)
        
        html_template = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificate Verification - {{ cert_id }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #1a56db 0%, #2563eb 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        .header h1 {
            font-size: 32px;
            margin-bottom: 10px;
        }
        .header p {
            font-size: 16px;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .section {
            margin-bottom: 30px;
        }
        .section h2 {
            font-size: 20px;
            color: #1a56db;
            margin-bottom: 15px;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 10px;
        }
        .info-row {
            display: flex;
            padding: 12px 0;
            border-bottom: 1px solid #f3f4f6;
        }
        .info-label {
            font-weight: 600;
            width: 200px;
            color: #6b7280;
        }
        .info-value {
            flex: 1;
            word-break: break-all;
        }
        .link {
            color: #2563eb;
            text-decoration: none;
            word-break: break-all;
        }
        .link:hover {
            text-decoration: underline;
        }
        .qr-section {
            text-align: center;
            padding: 30px;
            background: #f9fafb;
            border-radius: 8px;
            margin-top: 30px;
        }
        .qr-code {
            margin: 20px 0;
        }
        .qr-code img {
            max-width: 250px;
            height: auto;
        }
        .verify-button {
            display: inline-block;
            background: #2563eb;
            color: white;
            padding: 14px 28px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            margin-top: 20px;
            transition: background 0.3s;
        }
        .verify-button:hover {
            background: #1d4ed8;
        }
        .verification-steps {
            background: #f0f9ff;
            border-left: 4px solid #2563eb;
            padding: 20px;
            margin-top: 30px;
            border-radius: 4px;
        }
        .verification-steps ol {
            margin-left: 20px;
        }
        .verification-steps li {
            margin: 10px 0;
        }
        .status-badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            background: #dcfce7;
            color: #166534;
        }
        @media print {
            body { background: white; padding: 0; }
            .container { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✓ Certificate Verification</h1>
            <p>Blockchain-Anchored Learning Certificate</p>
        </div>
        
        <div class="content">
            <div class="section">
                <h2>Certificate Information</h2>
                <div class="info-row">
                    <div class="info-label">Certificate ID:</div>
                    <div class="info-value"><strong>{{ cert_id }}</strong></div>
                </div>
                <div class="info-row">
                    <div class="info-label">Learner Name:</div>
                    <div class="info-value">{{ learner_name }}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Course:</div>
                    <div class="info-value">{{ course_name }}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Date Issued:</div>
                    <div class="info-value">{{ issued_on }}</div>
                </div>
            </div>
            
            <div class="section">
                <h2>Blockchain Verification</h2>
                <div class="info-row">
                    <div class="info-label">Smart Contract:</div>
                    <div class="info-value">
                        CertRegistry @ {{ contract_address[:10] }}...{{ contract_address[-8:] }}<br>
                        <small>Network: {{ network_name }}</small>
                    </div>
                </div>
                {% if tx_hash %}
                <div class="info-row">
                    <div class="info-label">Transaction Hash:</div>
                    <div class="info-value">
                        <a href="https://mumbai.polygonscan.com/tx/{{ tx_hash }}" target="_blank" class="link">
                            {{ tx_hash }}
                        </a>
                    </div>
                </div>
                {% endif %}
                <div class="info-row">
                    <div class="info-label">IPFS Document CID:</div>
                    <div class="info-value">
                        <a href="{{ ipfs_url }}" target="_blank" class="link">{{ cid_doc }}</a><br>
                        <small>Protocol: <code>{{ ipfs_protocol_url }}</code></small>
                    </div>
                </div>
                <div class="info-row">
                    <div class="info-label">IPFS Gateway:</div>
                    <div class="info-value">
                        <a href="{{ ipfs_url }}" target="_blank" class="link">{{ ipfs_url }}</a>
                    </div>
                </div>
            </div>
            
            <div class="qr-section">
                <h2>Verify Certificate</h2>
                <p>Scan this QR code or click the button below to verify this certificate:</p>
                <div class="qr-code">
                    <img src="{{ qr_code_data }}" alt="QR Code" />
                </div>
                <a href="{{ verify_url }}" class="verify-button" target="_blank">
                    Verify Certificate Now →
                </a>
            </div>
            
            <div class="verification-steps">
                <h2>How to Verify</h2>
                <ol>
                    <li>Visit <a href="{{ verify_url }}" class="link">{{ verify_url }}</a></li>
                    <li>The system will check the certificate on the blockchain</li>
                    <li>Compare the stored IPFS CID with the certificate document</li>
                    <li>If they match, the certificate is <strong>verified</strong></li>
                    <li>View the original certificate document via the IPFS link</li>
                </ol>
            </div>
        </div>
    </div>
</body>
</html>
        """
        
        template = Template(html_template)
        html = template.render(
            cert_id=cert_id,
            learner_name=learner_name,
            course_name=course_name,
            issued_on=issued_on,
            cid_doc=cid_doc,
            ipfs_url=ipfs_url,
            ipfs_protocol_url=ipfs_protocol_url,
            tx_hash=tx_hash,
            contract_address=self.contract_address,
            network_name=self.network_name,
            verify_url=verify_url,
            qr_code_data=qr_code_data
        )
        
        return html
    
    def generate_pdf_proof_page(
        self,
        cert_id: str,
        learner_name: str,
        course_name: str,
        issued_on: str,
        cid_doc: str,
        tx_hash: Optional[str] = None,
        output_path: Optional[str] = None
    ) -> bytes:
        """
        Generate PDF proof page from HTML.
        
        Args:
            cert_id: Certificate ID
            learner_name: Learner full name
            course_name: Course name
            issued_on: Issue date
            cid_doc: IPFS CID of certificate document
            tx_hash: Blockchain transaction hash
            output_path: Optional path to save PDF
            
        Returns:
            PDF bytes
        """
        try:
            # Try weasyprint first
            try:
                from weasyprint import HTML
                
                html_content = self.generate_html_proof_page(
                    cert_id=cert_id,
                    learner_name=learner_name,
                    course_name=course_name,
                    issued_on=issued_on,
                    cid_doc=cid_doc,
                    tx_hash=tx_hash
                )
                
                pdf_bytes = HTML(string=html_content).write_pdf()
                
                if output_path:
                    with open(output_path, 'wb') as f:
                        f.write(pdf_bytes)
                    logger.info(f"Proof PDF generated: {output_path}")
                
                return pdf_bytes
            except (ImportError, OSError) as weasy_error:
                # If weasyprint fails (missing system libs or import error), use fallback
                logger.warning(f"weasyprint not available ({weasy_error}), using reportlab fallback")
                return self._generate_pdf_fallback(
                    cert_id, learner_name, course_name, issued_on, cid_doc, tx_hash, output_path
                )
        except Exception as e:
            # Final fallback - just use reportlab
            logger.error(f"Error generating proof PDF: {e}, using reportlab fallback")
            return self._generate_pdf_fallback(
                cert_id, learner_name, course_name, issued_on, cid_doc, tx_hash, output_path
            )
    
    def _generate_pdf_fallback(
        self,
        cert_id: str,
        learner_name: str,
        course_name: str,
        issued_on: str,
        cid_doc: str,
        tx_hash: Optional[str] = None,
        output_path: Optional[str] = None
    ) -> bytes:
        """Fallback PDF generation using reportlab."""
        from reportlab.lib.pagesizes import A4
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import inch
        from reportlab.lib import colors
        from reportlab.lib.enums import TA_CENTER, TA_LEFT
        from io import BytesIO
        
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        
        styles = getSampleStyleSheet()
        
        title_style = ParagraphStyle(
            'Title',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1a56db'),
            spaceAfter=20,
            alignment=TA_CENTER
        )
        
        content_style = ParagraphStyle(
            'Content',
            parent=styles['BodyText'],
            fontSize=11,
            alignment=TA_LEFT
        )
        
        story = []
        story.append(Paragraph("Certificate Verification", title_style))
        story.append(Spacer(1, 0.3*inch))
        
        story.append(Paragraph(f"<b>Certificate ID:</b> {cert_id}", content_style))
        story.append(Paragraph(f"<b>Learner:</b> {learner_name}", content_style))
        story.append(Paragraph(f"<b>Course:</b> {course_name}", content_style))
        story.append(Paragraph(f"<b>Issued On:</b> {issued_on}", content_style))
        story.append(Spacer(1, 0.2*inch))
        
        story.append(Paragraph(f"<b>IPFS CID:</b> {cid_doc}", content_style))
        story.append(Paragraph(f"<b>IPFS URL:</b> {self.ipfs_gateway_base}{cid_doc}", content_style))
        
        if tx_hash:
            story.append(Paragraph(f"<b>Transaction Hash:</b> {tx_hash}", content_style))
        
        story.append(Spacer(1, 0.3*inch))
        verify_url = f"{self.verify_base_url}?certId={cert_id}"
        story.append(Paragraph(f"<b>Verify at:</b> {verify_url}", content_style))
        
        doc.build(story)
        pdf_bytes = buffer.getvalue()
        
        if output_path:
            with open(output_path, 'wb') as f:
                f.write(pdf_bytes)
        
        return pdf_bytes

