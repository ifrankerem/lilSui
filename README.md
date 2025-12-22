# 🏛️ Agora - Decentralized Community Budget Governance

> **Note:** I run the entire project locally without errors. After deploying with Walrus, when I connect to Sui Name Service, I get a white screen. Therefore, I did not connect to Sui Name Service and deployed via GitHub workflow instead.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Smart Contract](#smart-contract)
- [Backend](#backend)
- [Frontend](#frontend)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)
- [How It Works](#how-it-works)

---

## 🌟 Overview

**Agora** is a decentralized community budget governance platform built on the Sui blockchain. It enables communities to:

- Create shared budgets with real SUI tokens
- Submit spending proposals
- Vote on proposals democratically
- Automatically execute approved proposals

The platform uses **Enoki** for gasless transactions (sponsored by the app) and **Google OAuth** for seamless Web2-style authentication while maintaining Web3 security.

---

##  Youtube Demo Video

https://www.youtube.com/watch?v=YEOlAbBSNcY

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│                    (React + TypeScript)                          │
│                   Deployed on Walrus Sites                       │
├─────────────────────────────────────────────────────────────────┤
│                              │                                   │
│                              ▼                                   │
├─────────────────────────────────────────────────────────────────┤
│                         BACKEND                                  │
│                    (Node. js + Express)                           │
│                    Deployed on Render                            │
│                              │                                   │
│              ┌───────────────┼───────────────┐                   │
│              ▼               ▼               ▼                   │
│     ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
│     │   Enoki     │  │  Sui RPC    │  │   Admin     │           │
│     │  Sponsor    │  │  (Testnet)  │  │  Keypair    │           │
│     └─────────────┘  └─────────────┘  └─────────────┘           │
├─────────────────────────────────────────────────────────────────┤
│                              │                                   │
│                              ▼                                   │
├─────────────────────────────────────────────────────────────────┤
│                      SUI BLOCKCHAIN                              │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    Move Smart Contract                      │ │
│  │                 community_budget::governance                │ │
│  │                                                              │ │
│  │  • AdminCap (admin authentication)                          │ │
│  │  • CommunityBudget (shared treasury)                        │ │
│  │  • Proposal (spending requests)                             │ │
│  │  • Vote mechanism with auto-execution                       │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Blockchain** | Sui Network (Testnet) |
| **Smart Contract** | Move Language |
| **Backend** | Node.js, Express, TypeScript |
| **Frontend** | React, TypeScript, Vite, TailwindCSS |
| **Authentication** | Google OAuth + Enoki zkLogin |
| **Gas Sponsorship** | Mysten Enoki |
| **Frontend Hosting** | Walrus Sites (Decentralized) |
| **Backend Hosting** | Render. com |
| **CI/CD** | GitHub Actions |

---

## 📜 Smart Contract

### Location: `contracts/sources/governance. move`

### Package ID
```
0x774c316bb580ed5d8709f90ce6fbbd9193e78484c3b6e8868d35d618453b93b5
```

### Core Structures

#### AdminCap
```move
public struct AdminCap has key, store {
    id: object::UID,
}
```
- Capability object for admin authentication
- Only the holder can create new budgets
- Transferred to admin address during contract initialization

#### CommunityBudget
```move
public struct CommunityBudget has key {
    id: object::UID,
    name: string::String,
    total: u64,
    spent: u64,
    funds: Balance<SUI>,
}
```
- Shared object holding community funds
- `total`: Initial budget amount in MIST (1 SUI = 1,000,000,000 MIST)
- `spent`: Amount already spent on approved proposals
- `funds`: Actual SUI balance

#### Proposal
```move
public struct Proposal has key {
    id: object::UID,
    budget_id: object::ID,
    title: string::String,
    description: string::String,
    amount: u64,
    status: ProposalStatus,
    yes_votes: u64,
    no_votes: u64,
    total_voters: u64,
    votes_cast: u64,
    creator: address,
    receiver: address,
    participants: vector<address>,
    voted: Table<address, bool>,
}
```
- Shared object representing a spending proposal
- Links to parent budget via `budget_id`
- Tracks voting progress and prevents double-voting

#### ProposalStatus
```move
public enum ProposalStatus has copy, drop, store {
    Voting(),
    Rejected(),
    Executed(),
}
```

### Entry Functions

#### `create_budget`
```move
public entry fun create_budget(
    _admin: &AdminCap,
    name_bytes: vector<u8>,
    coin: &mut Coin<SUI>,
    amount: u64,
    ctx: &mut tx_context::TxContext,
)
```
- **Access**: Admin only (requires AdminCap)
- **Action**: Creates a new community budget with deposited SUI
- **Parameters**:
  - `_admin`: Reference to AdminCap for authorization
  - `name_bytes`: Budget name as UTF-8 bytes
  - `coin`: Mutable reference to admin's SUI coin (will be split)
  - `amount`: Amount to deposit in MIST

#### `create_proposal`
```move
public entry fun create_proposal(
    budget: &CommunityBudget,
    title_bytes: vector<u8>,
    description_bytes: vector<u8>,
    amount: u64,
    receiver: address,
    participants: vector<address>,
    ctx: &mut tx_context::TxContext,
)
```
- **Access**: Anyone
- **Action**: Creates a spending proposal for a budget
- **Validation**: 
  - At least 1 participant required
  - Maximum 1000 participants
- **Emits**: `ProposalCreatedEvent`

#### `vote`
```move
public entry fun vote(
    budget: &mut CommunityBudget,
    proposal: &mut Proposal,
    choice: bool,
    ctx: &mut tx_context::TxContext,
)
```
- **Access**: Participants only
- **Action**: Casts a vote on a proposal
- **Validation**:
  - Voter must be in participants list
  - Cannot vote twice
  - Proposal must be in Voting status
- **Auto-finalization**: When all votes are cast, automatically:
  - If `yes_votes > no_votes`: Execute payment and emit `SpendingEvent`
  - Otherwise: Mark as Rejected

### Events

```move
public struct SpendingEvent has copy, drop {
    budget_id: object::ID,
    proposal_id: object::ID,
    amount: u64,
    receiver: address,
}

public struct ProposalCreatedEvent has copy, drop {
    proposal_id: object::ID,
    budget_id: object::ID,
    creator: address,
    participants: vector<address>,
}
```

---

## ⚙️ Backend

### Location: `backend/`

### Directory Structure
```
backend/
├── src/
│   ├── server. ts           # Express server entry point
│   ├── config/
│   │   └── sui. ts          # Sui configuration (PACKAGE_ID, etc.)
│   ├── lib/
│   │   ├── suiClient.ts    # Sui RPC client
│   │   ├── enokiClient.ts  # Enoki client for sponsorship
│   │   ├── keypair.ts      # Admin keypair management
│   │   ├── enokiSponsor.ts # Enoki sponsored transactions
│   │   └── directExecute.ts# Direct admin execution (no Enoki)
│   └── services/
│       └── governance. ts   # Business logic for all operations
├── package.json
└── tsconfig.json
```

### Key Files Explained

#### `src/lib/keypair.ts`
```typescript
export function getSponsorKeypair(): Ed25519Keypair {
  const envKey = process.env.SPONSOR_KEY;
  // Supports multiple formats:
  // 1) suiprivkey1....  (CLI export format)
  // 2) 0x.... (hex format)
  // 3) base64 fallback
  const secretBytes = parseSecretKey(envKey);
  return Ed25519Keypair.fromSecretKey(secretBytes);
}
```
Parses the admin private key from environment variable, supporting multiple formats for flexibility.

#### `src/lib/directExecute.ts`
```typescript
export async function executeWithAdminKey(tx: TransactionBlock) {
  const adminKeypair = getSponsorKeypair();
  tx.setSender(adminKeypair.getPublicKey(). toSuiAddress());
  tx.setGasBudget(50_000_000); // 0.05 SUI
  
  return await suiClient.signAndExecuteTransactionBlock({
    transactionBlock: tx,
    signer: adminKeypair,
    options: { showEffects: true, showObjectChanges: true },
  });
}
```
Used for admin-only operations (like `create_budget`) where gas is paid by admin wallet directly.

#### `src/lib/enokiSponsor.ts`
```typescript
export async function sponsorAndExecuteWithEnoki(tx: TransactionBlock, opts?) {
  // 1) Build transaction kind bytes
  const txBytes = await tx.build({ client: suiClient, onlyTransactionKind: true });
  
  // 2) Request sponsorship from Enoki
  const sponsored = await enokiClient.createSponsoredTransaction({
    network: ENOKI_CLIENT_NETWORK,
    transactionKindBytes: toB64(txBytes),
    sender: adminKeypair.getPublicKey().toSuiAddress(),
    ... opts
  });
  
  // 3) Sign with admin key
  const { signature } = await adminKeypair.signTransactionBlock(fromB64(sponsored.bytes));
  
  // 4) Execute sponsored transaction
  await enokiClient.executeSponsoredTransaction({ digest: sponsored.digest, signature });
  
  // 5) Fetch result from Sui RPC (with retry)
  return await suiClient.getTransactionBlock({ digest: sponsored.digest, ...  });
}
```
Used for user operations (proposals, voting) where gas is sponsored by Enoki.

#### `src/services/governance.ts`

Main business logic file containing:

| Function | Execution Method | Description |
|----------|------------------|-------------|
| `createBudgetOnChain` | Direct Admin | Creates budget with real SUI |
| `createProposalOnChain` | Enoki Sponsored | Creates spending proposal |
| `voteOnProposalOnChain` | Enoki Sponsored | Casts vote on proposal |
| `getBudget` | Read Only | Fetches budget details |
| `getProposal` | Read Only | Fetches proposal details |
| `getAllProposals` | Read Only | Lists all proposals via events |
| `getProposalsByUser` | Read Only | Lists user's proposals |
| `getSpendingEvents` | Read Only | Lists executed spending events |

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/budgets` | Create new budget (admin only) |
| GET | `/budgets/:id` | Get budget details |
| POST | `/proposals` | Create new proposal |
| GET | `/proposals` | List all proposals |
| GET | `/proposals/:id` | Get proposal details |
| POST | `/vote` | Cast vote on proposal |
| GET | `/logs` | Get spending history |

---

## 🎨 Frontend

### Location: `frontend/`

### Directory Structure
```
frontend/
├── src/
│   ├── main.tsx            # App entry point
│   ├── App.tsx             # Main app with routing
│   ├── config. ts           # Backend URL configuration
│   ├── components/
│   │   ├── Navbar.tsx      # Navigation with wallet connect
│   │   ├── Sidebar.tsx     # Side navigation
│   │   └── ... 
│   ├── pages/
│   │   ├── Home.tsx        # Dashboard
│   │   ├── CreateRequest.tsx # Budget & proposal creation
│   │   ├── ViewRequests.tsx  # Proposal listing & voting
│   │   └── BudgetHistory.tsx # Spending history
│   ├── hooks/
│   │   └── useEnokiFlow.ts # Enoki authentication hook
│   └── context/
│       └── AuthContext.tsx # Authentication state
├── index.html
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

### Authentication Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   User       │────▶│   Google     │────▶│   Enoki      │
│   Click      │     │   OAuth      │     │   zkLogin    │
│   Login      │     │   Consent    │     │   Proof      │
└──────────────┘     └──────────────┘     └──────────────┘
                                                 │
                                                 ▼
                                          ┌──────────────┐
                                          │   Sui        │
                                          │   Address    │
                                          │   Generated  │
                                          └──────────────┘
```

1. User clicks "Sign in with Google"
2. Google OAuth returns JWT token
3.  Enoki generates zkLogin proof
4. User receives a deterministic Sui address
5. All transactions are sponsored (gasless for user)

### Key Components

#### `config.ts`
```typescript
export const BACKEND_URL = "https://lilsui-1. onrender.com";
```

#### Admin Detection
```typescript
const ADMIN_ADDRESS = "0xea8ae94f8ff05578afe1ec7d5b55f30d864bf1f8411a39fe597fd755dbbfc41d";
const isAdmin = connectedAddress?. toLowerCase() === ADMIN_ADDRESS. toLowerCase();
```

---

## 🚀 Deployment

### Frontend (Walrus Sites via GitHub Actions)

#### Workflow: `. github/workflows/deploy-walrus.yml`

```yaml
name: Deploy to Walrus Sites

on:
  push:
    branches: [final]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          
      - name: Install frontend dependencies
        working-directory: ./frontend
        run: npm install
        
      - name: Build frontend
        working-directory: ./frontend
        env:
          VITE_BACKEND_URL: https://lilsui-1.onrender.com
          VITE_ENOKI_PUBLIC_KEY: ${{ secrets. VITE_ENOKI_PUBLIC_KEY }}
          VITE_GOOGLE_CLIENT_ID: ${{ secrets.VITE_GOOGLE_CLIENT_ID }}
        run: npm run build
        
      - name: Deploy to Walrus
        uses: zktx-io/walrus-sites-ga@v0.2.1
        with:
          config-path: ./frontend/walrus-sites-config.yaml
          site-path: ./frontend/dist
          network: testnet
          object-id: ${{ secrets. SITE_OBJECT_ID }}
```

### Backend (Render.com)

1. Connect GitHub repository to Render
2. Set build command: `npm install && npm run build`
3. Set start command: `npm start`
4. Add environment variables (see below)

---

## 🔐 Environment Variables

### Backend (Render Dashboard)

| Variable | Description | Example |
|----------|-------------|---------|
| `SUI_RPC_URL` | Sui RPC endpoint | `https://fullnode.testnet.sui.io` |
| `PACKAGE_ID` | Deployed Move package | `0x774c316bb... ` |
| `SPONSOR_KEY` | Admin private key | `suiprivkey1qz...` |
| `ENOKI_SECRET_KEY` | Enoki API secret | `enoki_private_... ` |
| `ENOKI_CLIENT_NETWORK` | Network selection | `testnet` |

### Frontend (GitHub Secrets for Actions)

| Secret | Description |
|--------|-------------|
| `VITE_ENOKI_PUBLIC_KEY` | Enoki public API key |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `SITE_OBJECT_ID` | Walrus site object ID |

### Local Development (`. env` files)

#### `backend/.env`
```env
SUI_RPC_URL=https://fullnode.testnet.sui.io
PACKAGE_ID=0x774c316bb580ed5d8709f90ce6fbbd9193e78484c3b6e8868d35d618453b93b5
SPONSOR_KEY=suiprivkey1qz... 
ENOKI_SECRET_KEY=enoki_private_...
ENOKI_CLIENT_NETWORK=testnet
```

#### `frontend/. env`
```env
VITE_BACKEND_URL=http://localhost:3000
VITE_ENOKI_PUBLIC_KEY=enoki_public_...
VITE_GOOGLE_CLIENT_ID=xxx. apps.googleusercontent.com
```

---

## 🔄 How It Works

### 1. Creating a Budget (Admin Only)

```
Admin → Frontend → Backend → Sui Blockchain
         │            │            │
         │ POST /budgets           │
         │ {adminCapId,            │
         │  name, coinId,          │
         │  amount}                │
         │            │            │
         │            │ executeWithAdminKey()
         │            │ (Direct execution,    │
         │            │  admin pays gas)      │
         │            │            │
         │            │            │ create_budget()
         │            │            │ Split coin
         │            │            │ Create CommunityBudget
         │            │            │ Share object
         │            │◀───────────│
         │◀───────────│            │
         │ {budgetId, txDigest}    │
```

### 2. Creating a Proposal (Any User)

```
User → Frontend → Backend → Enoki → Sui Blockchain
        │            │         │         │
        │ POST /proposals      │         │
        │            │         │         │
        │            │ sponsorAndExecuteWithEnoki()
        │            │─────────▶│         │
        │            │  Request │         │
        │            │  sponsor │         │
        │            │◀─────────│         │
        │            │  Signed  │         │
        │            │  tx      │         │
        │            │─────────▶│────────▶│
        │            │          │ Execute │ create_proposal()
        │            │          │         │ Emit ProposalCreatedEvent
        │            │◀─────────│◀────────│
        │◀───────────│          │         │
        │ {proposalId}          │         │
```

### 3. Voting Flow

```
Participant → Vote → All Votes Cast?  
                          │
              ┌───────────┴───────────┐
              │                       │
              ▼                       ▼
        Yes > No?                No >= Yes?
              │                       │
              ▼                       ▼
     ┌────────────────┐      ┌────────────────┐
     │ Execute        │      │ Reject         │
     │ - Transfer SUI │      │ - Mark status  │
     │ - Update spent │      │   as Rejected  │
     │ - Emit Event   │      └────────────────┘
     └────────────────┘
```

---

## 📱 Screenshots

### Home Dashboard
- View active budgets
- See recent proposals
- Quick stats overview

### Create Request
- Admin: Create new budgets with SUI deposit
- Users: Submit spending proposals

### View Requests
- List all proposals
- Filter by status
- Vote on active proposals

### Budget History
- Transaction log
- Spending analytics
- Export data

---

## 🧪 Local Development

### Prerequisites
- Node.js 20+
- Sui CLI
- Git

### Setup

```bash
# Clone repository
git clone https://github.com/ifrankerem/lilSui.git
cd lilSui

# Backend setup
cd backend
npm install
cp .env.example .env  # Edit with your values
npm run dev

# Frontend setup (new terminal)
cd frontend
npm install
cp .env.example .env  # Edit with your values
npm run dev
```

### Local URLs
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

---

## 📄 License

MIT License - feel free to use this project for learning and building! 

---

## 🙏 Acknowledgments

- [Mysten Labs](https://mystenlabs.com/) - Sui blockchain & Enoki
- [Walrus](https://walrus.xyz/) - Decentralized storage & sites
- [Sui Foundation](https://sui.io/) - Developer resources

---

**Built with ❤️ for the Sui ecosystem**
