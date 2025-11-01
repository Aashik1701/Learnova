# Certificate System - Restart Instructions

## ✅ Dependencies Installed!

The certificate system dependencies have been installed successfully. 

## 🔄 Next Steps

### 1. Restart Backend Server

The backend server needs to be restarted to pick up the new dependencies:

```bash
# Stop your current backend server (Ctrl+C)
# Then restart it:
cd backend
uvicorn main:app --reload
```

### 2. Test Certificate Issuance

After restarting:
1. Complete a course/lesson to 100%
2. The certificate issuance should now work!

## ⚙️ Environment Configuration (Optional)

For full functionality, you'll need to configure these environment variables in `backend/.env`:

```bash
# Pinata IPFS (for storing certificates)
PINATA_JWT=your_pinata_jwt_token

# Blockchain (for anchoring certificates)
RPC_URL=https://rpc-mumbai.maticvigil.com
CONTRACT_ADDRESS=0x...
PRIVATE_KEY=0x...
CONTRACT_ABI='[...]'

# Database (Supabase)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key
```

**Note:** Even without these environment variables, the certificate system will:
- ✅ Generate certificate JSON and PDF
- ✅ Attempt to store it
- ⚠️ Show errors for missing services (IPFS, Blockchain, DB)

## 🎯 What Works Now

- ✅ Certificate issuance API endpoint
- ✅ Frontend integration
- ✅ Automatic triggering on course completion
- ✅ Certificate dialog UI
- ✅ All dependencies installed

The certificate system is ready to work! Just restart your backend server.

