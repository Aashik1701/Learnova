# Blockchain Certificate System

This document provides a quick start guide for the blockchain-anchored certificate system.

## Quick Start

### 1. Database Migration

Run the Supabase migration to create the certificates table:

```bash
# In Supabase dashboard or via CLI
supabase db push
```

Or manually run the migration file:
`frontend/supabase/migrations/20250127000000_certificates_table.sql`

### 2. Environment Variables

Add these to your `.env` file in the backend directory:

```bash
# Pinata IPFS (get from https://pinata.cloud)
PINATA_JWT=your_jwt_token_here

# Blockchain (Polygon Mumbai testnet)
RPC_URL=https://rpc-mumbai.maticvigil.com
CONTRACT_ADDRESS=0xYourContractAddress
PRIVATE_KEY=0xYourPrivateKey
CONTRACT_ABI='[{"inputs":...}]'  # JSON array as string

# Database (Supabase)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key

# Optional - Email notifications
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_user
SMTP_PASSWORD=your_password
FROM_EMAIL=noreply@learnova.org

# URLs
VERIFY_BASE_URL=https://learnova.org/verify
IPFS_GATEWAY_BASE=https://ipfs.io/ipfs/
NETWORK_NAME=Polygon Mumbai
CERT_ISSUER=Learnova
```

### 3. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 4. Deploy Smart Contract

Deploy the CertRegistry contract to Polygon Mumbai. The contract should have:
- `storeCert(string certId, string cid, address owner)` function
- `getCertCID(string certId)` view function
- `CertStored` event

See `backend/docs/certificate_pipeline.md` for contract interface details.

### 5. Test the System

Issue a test certificate:

```bash
curl -X POST http://localhost:8000/internal/issue-certificate \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "courseId": "test-course-456",
    "grade": "Pass",
    "courseName": "Test Course",
    "learnerName": "John Doe",
    "durationHours": 10.0,
    "modules": 5
  }'
```

Verify the certificate:

```bash
curl http://localhost:8000/api/verify?certId=LEARNOVA-2025-000001
```

## Integration Example

Hook into your course completion handler:

```python
from app.services.certificate_pipeline import CertificatePipeline

async def handle_course_completion(user_id: str, course_id: str):
    # Fetch course and user data from database
    course = await get_course(course_id)
    user = await get_user(user_id)
    
    # Issue certificate
    pipeline = CertificatePipeline()
    result = await pipeline.issue_certificate(
        user_id=user_id,
        course_id=course_id,
        course_name=course['name'],
        learner_name=user['full_name'],
        grade=course['grade'],
        duration_hours=course['duration'],
        modules=course['module_count'],
        metadata={'language': 'en'}
    )
    
    if result['status'] == 'success':
        print(f"Certificate issued: {result['cert_id']}")
```

## Frontend Verification

The verification page is available at `/verify?certId=<certId>`.

Users can:
- View verification status
- See transaction hash with blockchain explorer link
- Access IPFS document
- Copy certificate information

## File Structure

```
backend/
├── app/
│   └── services/
│       ├── certificate_generator.py    # Certificate JSON/PDF generation
│       ├── proof_generator.py          # Proof page generation
│       ├── pinata_service.py           # IPFS pinning
│       ├── blockchain_service.py       # Smart contract interaction
│       ├── db_service.py               # Database operations
│       ├── email_service.py            # Email notifications
│       └── certificate_pipeline.py    # Main orchestration
├── tests/
│   └── test_certificate_pipeline.py    # Unit tests
└── docs/
    └── certificate_pipeline.md          # Detailed documentation

frontend/
├── src/
│   └── pages/
│       └── Verify.tsx                   # Verification page
└── supabase/
    └── migrations/
        └── 20250127000000_certificates_table.sql
```

## Troubleshooting

**"PINATA_JWT or (PINATA_API_KEY and PINATA_API_SECRET) required"**
→ Add Pinata credentials to `.env`

**"CONTRACT_ADDRESS environment variable is required"**
→ Set your deployed contract address

**"Failed to connect to RPC"**
→ Check RPC_URL and network connectivity

**Certificate verification returns "not_found"**
→ Check database connection and certificate ID

See `backend/docs/certificate_pipeline.md` for detailed troubleshooting.

## Testing

Run the test suite:

```bash
cd backend
pytest tests/test_certificate_pipeline.py -v
```

## Next Steps

1. Deploy CertRegistry smart contract to Polygon Mumbai
2. Configure all environment variables
3. Run database migration
4. Test certificate issuance
5. Integrate with course completion handler
6. Test end-to-end flow

For detailed documentation, see `backend/docs/certificate_pipeline.md`.

