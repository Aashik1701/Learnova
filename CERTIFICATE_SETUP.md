# Certificate System Setup Guide

## 🎯 Current Status

The certificate system is **working**, but some features require optional services:

### ✅ What Works NOW (No Configuration Needed):
- ✅ Certificate generation (JSON + PDF)
- ✅ Proof page generation (HTML + PDF)
- ✅ Certificate dialog on course completion
- ✅ Local certificate files

### ⚠️ Optional Features (Require Configuration):
- 🔷 IPFS Storage (Pinata) - for decentralized storage
- 🔷 Blockchain Anchoring - for on-chain verification
- 🔷 Database Storage - for certificate records
- 🔷 Email Notifications - for sending certificates

## 🚀 Quick Start (Works Without Configuration!)

The certificate system will now work **even without** Pinata, blockchain, or database setup! 

**Just complete a course and you'll see:**
- Certificate generated locally
- Certificate dialog shown
- Verification link provided

## 📝 Optional: Enable Full Features

If you want IPFS storage, blockchain verification, and database persistence:

### 1. Get Pinata JWT Token (for IPFS)
1. Go to https://app.pinata.cloud/
2. Sign up/login (free tier available)
3. Go to API Keys → Create New Key
4. Copy the JWT token

### 2. Setup Blockchain (Optional - for production)
- Deploy CertRegistry smart contract to Polygon Mumbai
- Get contract address
- Use a wallet with some MATIC for gas

### 3. Configure Environment Variables

Create `backend/.env` file:

```bash
# Minimal setup (just Pinata for IPFS)
PINATA_JWT=your_jwt_token_from_pinata

# Full setup (all features)
PINATA_JWT=your_jwt_token
RPC_URL=https://rpc-mumbai.maticvigil.com
CONTRACT_ADDRESS=0x...
PRIVATE_KEY=0x...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key
```

## 🎉 What Changed

The certificate system now works in **"Demo Mode"**:
- ✅ Generates certificates even without external services
- ✅ Shows certificate dialog on completion
- ✅ Provides verification links
- ⚠️ Skips IPFS/blockchain/database if not configured (with warnings in logs)

## 🔍 Testing

1. Complete a course/lesson to 100%
2. Certificate dialog should appear
3. You'll see certificate ID and verification link
4. Click "View & Verify Certificate" to see the verification page

The system now **works immediately** without any configuration! 🎊

