"""
Database service for certificate persistence.
Uses Supabase for database operations.
"""

import os
import logging
from typing import Dict, Any, Optional
from supabase import create_client, Client
from datetime import datetime

logger = logging.getLogger(__name__)

class DatabaseService:
    """Service for database operations related to certificates."""
    
    def __init__(self):
        """Initialize Supabase client."""
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_ANON_KEY")
        
        if not supabase_url or not supabase_key:
            raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_KEY (or SUPABASE_ANON_KEY) environment variables are required")
        
        self.client: Client = create_client(supabase_url, supabase_key)
        logger.info("Database service initialized")
    
    async def save_certificate(self, cert_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Save or update certificate record in database.
        
        Args:
            cert_data: Certificate data dictionary
            
        Returns:
            Saved certificate record
        """
        try:
            # Convert datetime to ISO string if needed
            data = cert_data.copy()
            if isinstance(data.get('issued_on'), datetime):
                data['issued_on'] = data['issued_on'].isoformat()
            
            # Upsert (insert or update if exists)
            result = self.client.table('certificates').upsert(
                data,
                on_conflict='cert_id'
            ).execute()
            
            if result.data:
                logger.info(f"Certificate {cert_data.get('cert_id')} saved to database")
                return result.data[0] if isinstance(result.data, list) else result.data
            else:
                raise Exception("Failed to save certificate: no data returned")
                
        except Exception as e:
            logger.error(f"Error saving certificate: {str(e)}")
            raise
    
    async def get_certificate(self, cert_id: str) -> Optional[Dict[str, Any]]:
        """
        Get certificate by ID.
        
        Args:
            cert_id: Certificate ID
            
        Returns:
            Certificate record or None
        """
        try:
            result = self.client.table('certificates').select('*').eq('cert_id', cert_id).execute()
            
            if result.data and len(result.data) > 0:
                return result.data[0]
            return None
            
        except Exception as e:
            logger.error(f"Error fetching certificate: {str(e)}")
            return None
    
    async def get_certificate_by_user_course(self, user_id: str, course_id: str) -> Optional[Dict[str, Any]]:
        """
        Get certificate by user ID and course ID.
        
        Args:
            user_id: User UUID
            course_id: Course UUID
            
        Returns:
            Certificate record or None
        """
        try:
            result = self.client.table('certificates').select('*').eq('user_id', user_id).eq('course_id', course_id).execute()
            
            if result.data and len(result.data) > 0:
                return result.data[0]
            return None
            
        except Exception as e:
            logger.error(f"Error fetching certificate by user/course: {str(e)}")
            return None
    
    async def get_user_certificates(self, user_id: str) -> list:
        """
        Get all certificates for a user.
        
        Args:
            user_id: User UUID
            
        Returns:
            List of certificate records
        """
        try:
            result = self.client.table('certificates').select('*').eq('user_id', user_id).order('issued_on', desc=True).execute()
            
            return result.data or []
            
        except Exception as e:
            logger.error(f"Error fetching user certificates: {str(e)}")
            return []
    
    async def revoke_certificate(self, cert_id: str, reason: Optional[str] = None) -> bool:
        """
        Revoke a certificate.
        
        Args:
            cert_id: Certificate ID
            reason: Optional revocation reason
            
        Returns:
            True if successful
        """
        try:
            update_data = {'revoked': True}
            if reason:
                update_data['meta'] = {'revocation_reason': reason}
            
            result = self.client.table('certificates').update(update_data).eq('cert_id', cert_id).execute()
            
            if result.data:
                logger.info(f"Certificate {cert_id} revoked")
                return True
            return False
            
        except Exception as e:
            logger.error(f"Error revoking certificate: {str(e)}")
            return False

