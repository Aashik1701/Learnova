"""
Blockchain service for interacting with CertRegistry smart contract.
Handles certificate storage on-chain via Polygon Mumbai (or other EVM networks).
"""

import os
import logging
from typing import Optional, Dict, Any
from web3 import Web3
from web3.middleware import geth_poa_middleware

logger = logging.getLogger(__name__)

class BlockchainService:
    """Service for interacting with CertRegistry smart contract."""
    
    def __init__(self):
        """Initialize Web3 connection and contract instance."""
        rpc_url = os.getenv("RPC_URL", "https://rpc-mumbai.maticvigil.com")
        contract_address = os.getenv("CONTRACT_ADDRESS")
        private_key = os.getenv("PRIVATE_KEY")
        
        if not contract_address:
            raise ValueError("CONTRACT_ADDRESS environment variable is required")
        if not private_key:
            raise ValueError("PRIVATE_KEY environment variable is required")
        
        # Initialize Web3
        self.w3 = Web3(Web3.HTTPProvider(rpc_url))
        
        # Add POA middleware for Polygon (required for Mumbai testnet)
        self.w3.middleware_onion.inject(geth_poa_middleware, layer=0)
        
        if not self.w3.is_connected():
            raise ConnectionError(f"Failed to connect to RPC: {rpc_url}")
        
        # Initialize account from private key
        self.account = self.w3.eth.account.from_key(private_key)
        self.issuer_address = self.account.address
        
        logger.info(f"Connected to blockchain. Issuer address: {self.issuer_address}")
        
        # Load contract ABI
        self.contract_address = Web3.to_checksum_address(contract_address)
        self.contract_abi = self._load_contract_abi()
        self.contract = self.w3.eth.contract(address=self.contract_address, abi=self.contract_abi)
        
    def _load_contract_abi(self) -> list:
        """
        Load contract ABI from environment variable or config file.
        
        For MVP, returns a minimal ABI for CertRegistry contract.
        """
        abi_json = os.getenv("CONTRACT_ABI")
        
        if abi_json:
            import json
            return json.loads(abi_json)
        
        # Default minimal ABI for CertRegistry contract
        # Expected methods: storeCert(string certId, string cid, address owner)
        #                  getCertCID(string certId) -> string
        return [
            {
                "inputs": [
                    {"internalType": "string", "name": "certId", "type": "string"},
                    {"internalType": "string", "name": "cid", "type": "string"},
                    {"internalType": "address", "name": "owner", "type": "address"}
                ],
                "name": "storeCert",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [{"internalType": "string", "name": "certId", "type": "string"}],
                "name": "getCertCID",
                "outputs": [{"internalType": "string", "name": "", "type": "string"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "anonymous": False,
                "inputs": [
                    {"indexed": False, "internalType": "string", "name": "certId", "type": "string"},
                    {"indexed": True, "internalType": "address", "name": "owner", "type": "address"},
                    {"indexed": False, "internalType": "string", "name": "cid", "type": "string"},
                    {"indexed": False, "internalType": "uint256", "name": "timestamp", "type": "uint256"}
                ],
                "name": "CertStored",
                "type": "event"
            }
        ]
    
    def store_certificate(self, cert_id: str, cid: str, owner_address: Optional[str] = None) -> Dict[str, Any]:
        """
        Store certificate CID on-chain via smart contract.
        
        Args:
            cert_id: Certificate ID (e.g., "LEARNOVA-2025-000123")
            cid: IPFS CID of the certificate document
            owner_address: Owner wallet address (defaults to issuer address)
            
        Returns:
            Dict containing transaction hash and receipt
            
        Raises:
            Exception: If transaction fails
        """
        if owner_address:
            owner_address = Web3.to_checksum_address(owner_address)
        else:
            owner_address = self.issuer_address
        
        # Check if certificate already exists (idempotency)
        try:
            existing_cid = self.get_certificate_cid(cert_id)
            if existing_cid and existing_cid == cid:
                logger.warning(f"Certificate {cert_id} already stored with same CID. Skipping.")
                return {
                    'tx_hash': None,
                    'status': 'already_stored',
                    'message': 'Certificate already stored with same CID'
                }
        except Exception as e:
            logger.debug(f"Could not check existing certificate: {e}")
        
        # Build transaction
        try:
            function = self.contract.functions.storeCert(cert_id, cid, owner_address)
            
            # Estimate gas
            gas_estimate = function.estimate_gas({'from': self.account.address})
            
            # Build transaction
            transaction = function.build_transaction({
                'from': self.account.address,
                'nonce': self.w3.eth.get_transaction_count(self.account.address),
                'gas': int(gas_estimate * 1.2),  # Add 20% buffer
                'gasPrice': self.w3.eth.gas_price,
            })
            
            # Sign transaction
            signed_txn = self.account.sign_transaction(transaction)
            
            # Send transaction
            logger.info(f"Sending transaction to store certificate {cert_id} on-chain...")
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            tx_hash_hex = tx_hash.hex()
            
            logger.info(f"Transaction sent. Hash: {tx_hash_hex}. Waiting for confirmation...")
            
            # Wait for confirmation (1 block for testnet)
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
            
            if receipt.status == 1:
                logger.info(f"Certificate {cert_id} successfully stored on-chain. Block: {receipt.blockNumber}")
                return {
                    'tx_hash': tx_hash_hex,
                    'block_number': receipt.blockNumber,
                    'status': 'confirmed',
                    'gas_used': receipt.gasUsed
                }
            else:
                raise Exception(f"Transaction failed with status {receipt.status}")
                
        except ValueError as e:
            logger.error(f"Transaction value error: {str(e)}")
            raise Exception(f"Failed to build transaction: {str(e)}")
        except Exception as e:
            logger.error(f"Transaction error: {str(e)}")
            raise Exception(f"Failed to store certificate on-chain: {str(e)}")
    
    def get_certificate_cid(self, cert_id: str) -> Optional[str]:
        """
        Get certificate CID from blockchain.
        
        Args:
            cert_id: Certificate ID to lookup
            
        Returns:
            CID string if found, None otherwise
        """
        try:
            cid = self.contract.functions.getCertCID(cert_id).call()
            return cid if cid else None
        except Exception as e:
            logger.debug(f"Certificate {cert_id} not found on-chain: {str(e)}")
            return None
    
    def verify_certificate(self, cert_id: str, expected_cid: str) -> bool:
        """
        Verify that a certificate CID matches the on-chain value.
        
        Args:
            cert_id: Certificate ID to verify
            expected_cid: Expected CID to compare
            
        Returns:
            True if CID matches, False otherwise
        """
        try:
            on_chain_cid = self.get_certificate_cid(cert_id)
            if not on_chain_cid:
                logger.warning(f"Certificate {cert_id} not found on-chain")
                return False
            
            matches = on_chain_cid.strip() == expected_cid.strip()
            if matches:
                logger.info(f"Certificate {cert_id} verified successfully")
            else:
                logger.warning(f"CID mismatch for {cert_id}: on-chain={on_chain_cid}, expected={expected_cid}")
            
            return matches
        except Exception as e:
            logger.error(f"Error verifying certificate: {str(e)}")
            return False
    
    @property
    def network_name(self) -> str:
        """Get the network name (e.g., 'Polygon Mumbai')."""
        chain_id = self.w3.eth.chain_id
        networks = {
            80001: "Polygon Mumbai",
            137: "Polygon Mainnet",
            1: "Ethereum Mainnet",
            5: "Goerli",
        }
        return networks.get(chain_id, f"Chain {chain_id}")

