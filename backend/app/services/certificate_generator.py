"""
Certificate generation service.
Creates canonical JSON certificates and renders them as PDFs.
"""

import os
import json
import logging
from datetime import datetime
from typing import Dict, Any, Optional
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT

logger = logging.getLogger(__name__)

class CertificateGenerator:
    """Service for generating canonical certificate JSON and PDF documents."""
    
    def __init__(self):
        """Initialize certificate generator."""
        self.issuer = os.getenv("CERT_ISSUER", "Learnova")
        self.serial_counter = self._load_serial_counter()
    
    def _load_serial_counter(self) -> int:
        """Load or initialize serial number counter."""
        counter_file = os.path.join(os.path.dirname(__file__), "../../.cert_serial")
        if os.path.exists(counter_file):
            try:
                with open(counter_file, 'r') as f:
                    return int(f.read().strip())
            except Exception:
                return 0
        return 0
    
    def _save_serial_counter(self, counter: int):
        """Save serial number counter."""
        counter_file = os.path.join(os.path.dirname(__file__), "../../.cert_serial")
        try:
            with open(counter_file, 'w') as f:
                f.write(str(counter))
        except Exception as e:
            logger.warning(f"Failed to save serial counter: {e}")
    
    def generate_cert_id(self, year: Optional[int] = None) -> str:
        """
        Generate a canonical certificate ID.
        Format: LEARNOVA-YYYY-<serial>
        
        Args:
            year: Year for certificate (defaults to current year)
            
        Returns:
            Certificate ID string
        """
        if year is None:
            year = datetime.now().year
        
        self.serial_counter += 1
        serial = str(self.serial_counter).zfill(6)
        cert_id = f"LEARNOVA-{year}-{serial}"
        
        self._save_serial_counter(self.serial_counter)
        return cert_id
    
    def create_canonical_json(
        self,
        cert_id: str,
        name: str,
        learner_id: str,
        course_id: str,
        course_name: str,
        issued_on: datetime,
        issuer_address: str,
        grade: str,
        duration_hours: float,
        modules: int,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Create canonical certificate JSON (deterministic field order).
        
        IMPORTANT: This JSON must NOT include CID or txHash.
        Field order must be consistent for deterministic CID generation.
        
        Args:
            cert_id: Certificate ID
            name: Learner full name
            learner_id: User UUID
            course_id: Course UUID
            course_name: Course name
            issued_on: Issue timestamp
            issuer_address: Blockchain wallet address
            grade: Pass/Distinction or score
            duration_hours: Course duration in hours
            modules: Number of modules completed
            metadata: Additional metadata
            
        Returns:
            Canonical JSON dictionary
        """
        # Canonical field order (alphabetical within nested structures)
        certificate = {
            "certId": cert_id,
            "courseId": course_id,
            "courseName": course_name,
            "durationHours": duration_hours,
            "grade": grade,
            "issuedOn": issued_on.isoformat(),
            "issuer": self.issuer,
            "issuerAddress": issuer_address,
            "learnerId": learner_id,
            "metadata": metadata or {},
            "modules": modules,
            "name": name
        }
        
        return certificate
    
    def render_pdf(self, certificate_data: Dict[str, Any], output_path: str):
        """
        Render certificate PDF from canonical JSON data.
        
        Args:
            certificate_data: Canonical certificate JSON
            output_path: Path to save PDF
        """
        doc = SimpleDocTemplate(
            output_path,
            pagesize=A4,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=18
        )
        
        styles = getSampleStyleSheet()
        
        # Custom styles
        title_style = ParagraphStyle(
            'CertificateTitle',
            parent=styles['Heading1'],
            fontSize=28,
            textColor=colors.HexColor('#1a56db'),
            spaceAfter=30,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        )
        
        heading_style = ParagraphStyle(
            'CertificateHeading',
            parent=styles['Heading2'],
            fontSize=18,
            textColor=colors.HexColor('#374151'),
            spaceAfter=12,
            alignment=TA_CENTER
        )
        
        content_style = ParagraphStyle(
            'CertificateContent',
            parent=styles['BodyText'],
            fontSize=12,
            textColor=colors.HexColor('#1f2937'),
            alignment=TA_LEFT,
            spaceAfter=12
        )
        
        # Build PDF content
        story = []
        
        # Title
        story.append(Paragraph("Certificate of Completion", title_style))
        story.append(Spacer(1, 0.5*inch))
        
        # Main content
        story.append(Paragraph(
            f"This certifies that <b>{certificate_data['name']}</b> has successfully completed the course:",
            content_style
        ))
        story.append(Spacer(1, 0.2*inch))
        
        story.append(Paragraph(
            f"<b>{certificate_data['courseName']}</b>",
            heading_style
        ))
        story.append(Spacer(1, 0.3*inch))
        
        # Certificate details table
        cert_details = [
            ['Certificate ID:', certificate_data['certId']],
            ['Course ID:', certificate_data['courseId']],
            ['Grade:', certificate_data['grade']],
            ['Duration:', f"{certificate_data['durationHours']} hours"],
            ['Modules Completed:', str(certificate_data['modules'])],
            ['Issued On:', certificate_data['issuedOn']],
            ['Issuer:', certificate_data['issuer']],
        ]
        
        table = Table(cert_details, colWidths=[2.5*inch, 4*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f3f4f6')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 11),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey),
        ]))
        
        story.append(table)
        story.append(Spacer(1, 0.3*inch))
        
        # Footer
        story.append(Paragraph(
            "This certificate is issued by Learnova and anchored on the blockchain.",
            ParagraphStyle(
                'Footer',
                parent=styles['Normal'],
                fontSize=10,
                textColor=colors.HexColor('#6b7280'),
                alignment=TA_CENTER,
                spaceBefore=20
            )
        ))
        
        # Build PDF
        doc.build(story)
        logger.info(f"Certificate PDF generated: {output_path}")

