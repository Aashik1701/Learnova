# Certificate Issuance Pipeline Documentation

## Overview

This document describes the blockchain-anchored certificate issuance pipeline integrated into the Learnova backend. The pipeline automatically generates, pins to IPFS, stores on blockchain, and verifies learning certificates when learners complete courses.

## Architecture

The certificate pipeline consists of several integrated services:

1. **Certificate Generator** - Creates canonical JSON and PDF certificates
2. **Proof Generator** - Generates human-readable proof pages (HTML/PDF)
3. **Pinata Service** - Handles IPFS pinning via Pinata
4. **Blockchain Service** - Interacts with CertRegistry smart contract on Polygon Mumbai
5. **Database Service** - Persists certificate records in Supabase
6. **Email Service** - Sends verification emails to learners
7. **Certificate Pipeline** - Orchestrates the entire flow

## Flow Diagram

```
Course Completion Event
    ↓
POST /internal/issue-certificate
    ↓
1. Generate Certificate ID (LEARNOVA-YYYY-XXXXXX)
2. Create Canonical JSON (no CID/txHash)
3. Render PDF from JSON
4. Pin PDF to IPFS (Pinata) → CID_doc
5. Store CID on Blockchain (CertRegistry.storeCert) → txHash
6. Generate Proof Page (HTML + PDF)
7. Pin Proof Page to IPFS → CID_proof (optional)
8. Save to Database (certificates table)
9. Send Verification Email
    ↓
Certificate Issued ✓
```

## API Endpoints

### POST /internal/issue-certificate

Internal endpoint triggered on course completion. Issues a new certificate.

**Request Body:**
```json
{
  "userId": "user-uuid",
  "courseId": "course-uuid",
  "grade": "Pass" | "Distinction" | "Score",
  "courseName": "Course Name",
  "learnerName": "Learner Full Name",
  "durationHours": 10.0,
  "modules": 5,
  "metadata": {
    "language": "en",
    "mode": "self-paced"
  },
  "ownerAddress": "0x..." // Optional
}
```

**Response (Success):**
```json
{
  "status": "success",
  "cert_id": "LEARNOVA-2025-000123",
  "cid_doc": "Qm...",
  "cid_proof": "Qm...",
  "tx_hash": "0x...",
  "verify_url": "https://learnova.org/verify?certId=LEARNOVA-2025-000123",
  "proof_url": "https://ipfs.io/ipfs/Qm...",
  "issued_on": "2025-01-27T12:00:00Z"
}
```

### GET /api/verify?certId=<certId>

Public endpoint for verifying certificates.

**Response (Verified):**
```json
{
  "verified": true,
  "status": "verified",
  "cert_id": "LEARNOVA-2025-000123",
  "on_chain_cid": "Qm...",
  "db_cid": "Qm...",
  "tx_hash": "0x...",
  "issued_on": "2025-01-27T12:00:00Z",
  "proof_url": "https://ipfs.io/ipfs/Qm...",
  "verify_url": "https://learnova.org/verify?certId=LEARNOVA-2025-000123"
}
```

**Response (Not Verified):**
```json
{
  "verified": false,
  "status": "not_found" | "mismatch" | "revoked",
  "message": "Error message"
}
```

### POST /internal/revoke-certificate?certId=<certId>&reason=<reason>

Internal endpoint for revoking certificates.

## Environment Variables

Required environment variables for the certificate pipeline:

```bash
# Pinata IPFS Configuration
PINATA_JWT=your_pinata_jwt_token
# OR
PINATA_API_KEY=your_api_key
PINATA_API_SECRET=your_api_secret

# IPFS Gateway
IPFS_GATEWAY_BASE=https://ipfs.io/ipfs/

# Blockchain Configuration
RPC_URL=https://rpc-mumbai.maticvigil.com
CONTRACT_ADDRESS=0x...
CONTRACT_ABI='[{"inputs":...}]'  # JSON string
PRIVATE_KEY=0x...  # Server signer private key

# Database (Supabase)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key

# Email Configuration (Optional)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASSWORD=your_smtp_password
FROM_EMAIL=noreply@learnova.org
FROM_NAME=Learnova

# Frontend URLs
VERIFY_BASE_URL=https://learnova.org/verify
NETWORK_NAME=Polygon Mumbai

# Certificate Issuer
CERT_ISSUER=Learnova
```

## Database Schema

The `certificates` table structure:

```sql
CREATE TABLE certificates (
  cert_id VARCHAR(255) PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  course_id UUID NOT NULL,
  cid_doc VARCHAR(255) NOT NULL,
  cid_proof VARCHAR(255),
  tx_hash VARCHAR(255),
  issuer_addr VARCHAR(255) NOT NULL,
  issued_on TIMESTAMP WITH TIME ZONE NOT NULL,
  revoked BOOLEAN DEFAULT false,
  status VARCHAR(50) DEFAULT 'pending',
  meta JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

## Certificate JSON Schema

The canonical certificate JSON (before IPFS pinning) must follow this structure:

```json
{
  "certId": "LEARNOVA-2025-000123",
  "courseId": "course-uuid",
  "courseName": "Course Name",
  "durationHours": 10.0,
  "grade": "Pass",
  "issuedOn": "2025-01-27T12:00:00Z",
  "issuer": "Learnova",
  "issuerAddress": "0x...",
  "learnerId": "user-uuid",
  "metadata": {
    "language": "en",
    "mode": "self-paced"
  },
  "modules": 5,
  "name": "Learner Full Name"
}
```

**Important:** The canonical JSON must NOT include:
- `cid_doc` (IPFS CID)
- `txHash` (blockchain transaction hash)

Field order should be consistent (alphabetical) for deterministic CID generation.

## Smart Contract Interface

The CertRegistry contract must implement:

```solidity
function storeCert(string memory certId, string memory cid, address owner) public;
function getCertCID(string memory certId) public view returns (string memory);
event CertStored(string indexed certId, address indexed owner, string cid, uint256 timestamp);
```

## Error Handling

The pipeline includes comprehensive error handling:

1. **IPFS Upload Failures**: Retries 3 times with exponential backoff
2. **Blockchain Transaction Failures**: Retries with gas estimation and nonce management
3. **Database Failures**: Logs errors and marks certificate status as "failed"
4. **Email Failures**: Non-critical, logs warning but continues

All failures are logged and certificates are saved with appropriate status flags for retry mechanisms.

## Testing

Run tests:

```bash
cd backend
pytest tests/test_certificate_pipeline.py -v
```

Tests cover:
- Certificate ID generation
- Canonical JSON creation
- Successful issuance flow
- Idempotency checks
- Verification flow
- CID mismatch detection

## Deployment Notes

1. **Smart Contract Deployment**: Deploy CertRegistry contract to Polygon Mumbai testnet (or mainnet)
2. **Environment Setup**: Configure all required environment variables
3. **Database Migration**: Run the certificates table migration
4. **Private Key Security**: Store private key securely (use secrets manager in production)
5. **Gas Management**: Ensure issuer wallet has sufficient MATIC for transactions

## Integration with Course Completion

Hook into your course completion event handler:

```python
from app.services.certificate_pipeline import CertificatePipeline

async def on_course_complete(user_id: str, course_id: str, course_data: dict):
    pipeline = CertificatePipeline()
    
    await pipeline.issue_certificate(
        user_id=user_id,
        course_id=course_id,
        course_name=course_data['name'],
        learner_name=course_data['learner_name'],
        grade=course_data['grade'],
        duration_hours=course_data['duration'],
        modules=course_data['module_count'],
        metadata=course_data.get('metadata')
    )
```

## Verification Frontend

The verification page is available at `/verify?certId=<certId>` and:
- Calls the `/api/verify` endpoint
- Displays verification status with badges
- Shows transaction hash with PolygonScan links
- Provides IPFS gateway links
- Allows copying certificate information

## Security Considerations

1. **Private Keys**: Never commit private keys to version control
2. **API Keys**: Use environment variables and secrets management
3. **RLS Policies**: Database has appropriate row-level security
4. **PII**: Consider encrypting PII in IPFS documents if required
5. **Rate Limiting**: Add rate limiting to public verification endpoint

## Troubleshooting

**Certificate issuance fails:**
- Check Pinata API credentials
- Verify blockchain RPC connection
- Ensure contract address is correct
- Check private key has sufficient funds

**Verification fails:**
- Confirm certificate exists in database
- Check blockchain RPC is accessible
- Verify contract ABI matches deployed contract

**IPFS upload fails:**
- Check Pinata API limits/quota
- Verify network connectivity
- Check file size limits

## Support

For issues or questions, check logs in the application output and verify all environment variables are correctly configured.

