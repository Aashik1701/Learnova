"""
Email service for sending certificate verification emails.
Supports multiple email providers (SMTP, SendGrid, etc.)
"""

import os
import logging
from typing import Optional, Dict, Any
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

logger = logging.getLogger(__name__)

class EmailService:
    """Service for sending certificate verification emails."""
    
    def __init__(self):
        """Initialize email service configuration."""
        self.smtp_host = os.getenv("SMTP_HOST")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_user = os.getenv("SMTP_USER")
        self.smtp_password = os.getenv("SMTP_PASSWORD")
        self.from_email = os.getenv("FROM_EMAIL", "noreply@learnova.org")
        self.from_name = os.getenv("FROM_NAME", "Learnova")
    
    async def send_certificate_email(
        self,
        recipient_email: Optional[str],
        recipient_name: str,
        cert_id: str,
        course_name: str,
        verify_url: str,
        proof_url: str,
        tx_hash: Optional[str] = None,
        cid_doc: Optional[str] = None
    ) -> bool:
        """
        Send certificate verification email to learner.
        
        Args:
            recipient_email: Recipient email address (if None, will log instead)
            recipient_name: Recipient name
            cert_id: Certificate ID
            course_name: Course name
            verify_url: Verification URL
            proof_url: Proof page URL
            tx_hash: Transaction hash
            cid_doc: IPFS CID
            
        Returns:
            True if sent successfully
        """
        if not recipient_email:
            logger.info(f"Email not configured or recipient email missing. Would send to {recipient_name}")
            logger.info(f"Verification URL: {verify_url}")
            logger.info(f"Proof URL: {proof_url}")
            return True  # Non-critical, just log
        
        if not self.smtp_host or not self.smtp_user:
            logger.warning("SMTP not configured. Skipping email send.")
            return True  # Non-critical
        
        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = f"Your Learnova Certificate - {course_name}"
            msg['From'] = f"{self.from_name} <{self.from_email}>"
            msg['To'] = recipient_email
            
            # Create HTML email body
            html_body = self._create_email_html(
                recipient_name=recipient_name,
                cert_id=cert_id,
                course_name=course_name,
                verify_url=verify_url,
                proof_url=proof_url,
                tx_hash=tx_hash,
                cid_doc=cid_doc
            )
            
            # Create plain text email body
            text_body = self._create_email_text(
                recipient_name=recipient_name,
                cert_id=cert_id,
                course_name=course_name,
                verify_url=verify_url,
                proof_url=proof_url,
                tx_hash=tx_hash,
                cid_doc=cid_doc
            )
            
            # Attach parts
            msg.attach(MIMEText(text_body, 'plain'))
            msg.attach(MIMEText(html_body, 'html'))
            
            # Send email
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)
            
            logger.info(f"Certificate email sent to {recipient_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email: {str(e)}")
            return False
    
    def _create_email_html(
        self,
        recipient_name: str,
        cert_id: str,
        course_name: str,
        verify_url: str,
        proof_url: str,
        tx_hash: Optional[str] = None,
        cid_doc: Optional[str] = None
    ) -> str:
        """Create HTML email body."""
        return f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #1a56db 0%, #2563eb 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }}
        .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }}
        .button {{ display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }}
        .info {{ background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }}
        .footer {{ text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎓 Congratulations!</h1>
            <p>Your certificate has been issued</p>
        </div>
        <div class="content">
            <p>Dear {recipient_name},</p>
            <p>Congratulations on completing <strong>{course_name}</strong>!</p>
            <p>Your certificate has been issued and anchored on the blockchain. You can verify and share it using the links below.</p>
            
            <div class="info">
                <p><strong>Certificate ID:</strong> {cert_id}</p>
                <p><strong>Course:</strong> {course_name}</p>
            </div>
            
            <div style="text-align: center;">
                <a href="{verify_url}" class="button">Verify Certificate</a>
                <br>
                <a href="{proof_url}" class="button" style="background: #059669;">View Proof Page</a>
            </div>
            
            {f'<div class="info"><p><strong>Transaction Hash:</strong> {tx_hash}</p><p><strong>IPFS CID:</strong> {cid_doc}</p></div>' if tx_hash or cid_doc else ''}
            
            <p>You can share your certificate by sending the verification link above. Employers and verifiers can use it to verify your achievement on the blockchain.</p>
            
            <div class="footer">
                <p>Best regards,<br>The Learnova Team</p>
                <p>This is an automated message. Please do not reply.</p>
            </div>
        </div>
    </div>
</body>
</html>
        """
    
    def _create_email_text(
        self,
        recipient_name: str,
        cert_id: str,
        course_name: str,
        verify_url: str,
        proof_url: str,
        tx_hash: Optional[str] = None,
        cid_doc: Optional[str] = None
    ) -> str:
        """Create plain text email body."""
        return f"""
Congratulations {recipient_name}!

You have successfully completed {course_name}.

Certificate ID: {cert_id}

Verify your certificate: {verify_url}
View proof page: {proof_url}

{f'Transaction Hash: {tx_hash}' if tx_hash else ''}
{f'IPFS CID: {cid_doc}' if cid_doc else ''}

You can share your certificate by sending the verification link above.

Best regards,
The Learnova Team
        """

