"""
Pinata IPFS service for pinning files to IPFS.
Handles upload and pinning of certificate documents and proof pages.
"""

import os
import logging
import time
import requests
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

class PinataService:
    """Service for interacting with Pinata IPFS pinning service."""
    
    def __init__(self):
        """Initialize Pinata client with API credentials."""
        self.api_key = os.getenv("PINATA_API_KEY")
        self.api_secret = os.getenv("PINATA_API_SECRET")
        self.jwt_token = os.getenv("PINATA_JWT")
        
        if not (self.jwt_token or (self.api_key and self.api_secret)):
            raise ValueError("PINATA_JWT or (PINATA_API_KEY and PINATA_API_SECRET) environment variables are required")
        
        self.base_url = "https://api.pinata.cloud"
        self.max_retries = 3
        self.retry_delay = 2  # seconds
    
    def _get_headers(self) -> dict:
        """Get headers for Pinata API requests."""
        if self.jwt_token:
            return {
                "Authorization": f"Bearer {self.jwt_token}"
            }
        else:
            return {
                "pinata_api_key": self.api_key,
                "pinata_secret_api_key": self.api_secret
            }
        
    def pin_file(self, file_path: str, file_name: Optional[str] = None) -> Dict[str, Any]:
        """
        Pin a file to IPFS via Pinata.
        
        Args:
            file_path: Path to the file to pin
            file_name: Optional custom name for the file
            
        Returns:
            Dict containing 'IpfsHash' (CID) and other metadata
            
        Raises:
            Exception: If pinning fails after retries
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")
        
        file_name = file_name or os.path.basename(file_path)
        
        for attempt in range(1, self.max_retries + 1):
            try:
                logger.info(f"Pinning file to IPFS (attempt {attempt}/{self.max_retries}): {file_name}")
                
                url = f"{self.base_url}/pinning/pinFileToIPFS"
                headers = self._get_headers()
                
                import json as json_lib
                with open(file_path, 'rb') as f:
                    files = {'file': (file_name, f, 'application/octet-stream')}
                    
                    # Optional pinata metadata
                    pinata_metadata = {
                        'name': file_name
                    }
                    
                    # Pinata expects pinataMetadata as a JSON string in the form data
                    data = {'pinataMetadata': json_lib.dumps(pinata_metadata)}
                    
                    response = requests.post(
                        url,
                        files=files,
                        headers=headers,
                        data=data
                    )
                    
                    response.raise_for_status()
                    result = response.json()
                
                if 'IpfsHash' in result:
                    cid = result['IpfsHash']
                    logger.info(f"Successfully pinned file to IPFS. CID: {cid}")
                    return {
                        'cid': cid,
                        'ipfs_url': f"ipfs://{cid}",
                        'gateway_url': f"{os.getenv('IPFS_GATEWAY_BASE', 'https://ipfs.io/ipfs/')}{cid}",
                        'metadata': result
                    }
                else:
                    raise ValueError(f"Unexpected response from Pinata: {result}")
                    
            except requests.HTTPError as e:
                logger.error(f"HTTP error pinning file (attempt {attempt}): {str(e)}")
                if attempt < self.max_retries:
                    time.sleep(self.retry_delay * attempt)
                    continue
                raise
            except Exception as e:
                logger.error(f"Error pinning file (attempt {attempt}): {str(e)}")
                if attempt < self.max_retries:
                    time.sleep(self.retry_delay * attempt)
                    continue
                raise
        
        raise Exception(f"Failed to pin file after {self.max_retries} attempts")
    
    def pin_json(self, json_data: Dict[str, Any], file_name: str = "certificate.json") -> Dict[str, Any]:
        """
        Pin JSON data to IPFS via Pinata.
        
        Args:
            json_data: Dictionary to pin as JSON
            file_name: Name for the JSON file
            
        Returns:
            Dict containing 'cid' and URL information
        """
        import tempfile
        import json
        
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as tmp_file:
            json.dump(json_data, tmp_file, indent=2, ensure_ascii=False, sort_keys=True)
            tmp_path = tmp_file.name
        
        try:
            return self.pin_file(tmp_path, file_name)
        finally:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)
    
    def pin_buffer(self, file_buffer: bytes, file_name: str) -> Dict[str, Any]:
        """
        Pin file buffer (bytes) to IPFS via Pinata.
        
        Args:
            file_buffer: Bytes content to pin
            file_name: Name for the file
            
        Returns:
            Dict containing 'cid' and URL information
        """
        import tempfile
        
        with tempfile.NamedTemporaryFile(mode='wb', delete=False) as tmp_file:
            tmp_file.write(file_buffer)
            tmp_path = tmp_file.name
        
        try:
            return self.pin_file(tmp_path, file_name)
        finally:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)

