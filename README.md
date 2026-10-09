<div align="center">

# 🏛️ Agora

**On-chain community budget governance on Sui — shared treasuries, proposals, democratic votes and automatic execution.**

![Sui](https://img.shields.io/badge/Sui-testnet-6FBC4F?style=flat-square)
![Move](https://img.shields.io/badge/contracts-Move-000?style=flat-square)
![Enoki](https://img.shields.io/badge/gas-Enoki%20sponsored-119EFF?style=flat-square)
![Walrus](https://img.shields.io/badge/hosting-Walrus%20Sites-00C2FF?style=flat-square)
![Demo](https://img.shields.io/badge/demo-YouTube-FF0000?style=flat-square&logo=youtube)
![Stars](https://img.shields.io/github/stars/ifrankerem/lilSui?style=flat-square)

</div>

> **Note:** the project runs locally without errors. After deploying with
> Walrus, connecting to Sui Name Service produces a white screen, so the
> frontend is deployed through a GitHub workflow instead.

---

## 📋 Table of Contents

- [About](#about)
- [What It Does](#what-it-does)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [How It Works](#how-it-works)
- [Demo](#demo)
- [Author](#author)

---

## 📖 About

**Agora** is a decentralized community budget governance platform built on the
**Sui** blockchain. Communities create shared budgets with real SUI tokens,
submit spending proposals, vote on them democratically and have approved
proposals executed automatically.

**Enoki** covers gas so members never hold tokens to vote, and **Google OAuth**
gives them a Web2-style sign-in without giving up Web3 security.

---

## 💡 What It Does

- Create a shared budget holding real SUI tokens
- Submit spending proposals against it
- Vote — one member, one weight, democratically
- Automatic execution once a proposal passes, with no trusted intermediate

---

## 🏗️ Architecture

```
        Frontend (React + TS)  ── Walrus Sites
                 │
                 ▼
        Backend (Node + Express) ── Render
           │          │
        Enoki      Sui RPC
        sponsor    (testnet)
           │          │
           └────┬─────┘
                ▼
        SUI BLOCKCHAIN
        Move module: community_budget::governance
        AdminCap · CommunityBudget · Proposal · Vote
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Blockchain | Sui Network (testnet) |
| Smart contract | Move |
| Backend | Node.js, Express, TypeScript |
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| Auth | Google OAuth + Enoki zkLogin |
| Gas sponsorship | Mysten Enoki |
| Hosting | Walrus Sites (frontend), Render (backend) |

---

## ⚙️ How It Works

1. A community is bootstrapped with a `CommunityBudget` shared object and an
   `AdminCap` held by whoever created it.
2. Members deposit SUI into the shared budget object.
3. Anyone submits a `Proposal` naming a recipient, amount and reason.
4. Members vote; votes are tracked on the proposal object.
5. When the voting rule is satisfied, the **execution** path runs inside the
   Move module itself — the contract, not the server, pays out the coins.
6. The backend only indexes and serves; the chain is the source of truth.

---

## 🎥 Demo

▶️ [Watch on YouTube](https://www.youtube.com/watch?v=YEOlAbBSNcY)

---

## 👤 Author

**İrfan Kerem Arslan** — [@ifrankerem](https://github.com/ifrankerem)

---

## 📄 License

Built for a hackathon — open for educational and portfolio use.

---

## 🙏 Acknowledgements

- [awesome-readme](https://github.com/matiassingers/awesome-readme) — structure inspiration for this README