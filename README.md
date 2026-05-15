# VersaTECH | Enterprise IT Support Simulator

**VersaTECH** is a full-stack technical simulator designed to replicate an enterprise-level IT Service Desk environment. It bridges the gap between hardware diagnostics and software troubleshooting by providing a reactive dashboard where users can manage, analyze, and resolve technical tickets using a keyword-driven Knowledge Base (KB) engine.

---

## 🚀 System Overview

The application utilizes a **React** frontend for real-time ticket management and a **Node.js/Express** backend to handle data persistence and intelligence matching.

### Key Features
*   **Keyword Intelligence Engine:** Automatically scans ticket issue strings to suggest specific KB solutions (e.g., VPN, hardware, account issues).
*   **Dynamic Ticket Queue:** Real-time filtering and status tracking for active IT incidents.
*   **Technical Documentation Guardrails:** Enforces a 20-character minimum for resolution notes to ensure high-quality documentation standards.
*   **Enterprise UI:** Built with Tailwind CSS and Lucide-React for a clean, professional "System Admin" aesthetic.

---

## 🛠️ Technical Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS |
| **Backend** | Node.js, Express.js |
| **Icons** | Lucide-React |
| **Data** | JSON-based flat-file persistence |
| **Runtime** | Node v22.13.0 (NVM managed) |

---

## 📥 Installation & Setup

To run this project locally, ensure you have **Node.js** installed.

### 1. Clone the Repository

Bash
git clone [https://github.com/YOUR_USERNAME/VersaTECH.git](https://github.com/YOUR_USERNAME/VersaTECH.git)
cd VersaTECH

### 2. Configure the Backend
From the root directory:

Bash
npm install
node index.js
The server will start on http://localhost:3001.

### 3. Configure the Frontend
Open a second terminal window:

Bash
cd client
npm install
npm run dev
The UI will be accessible at http://localhost:5173.

📂 Project Structure
Plaintext
VersaTECH/
├── client/                # React Frontend (Vite)
│   ├── src/
│   │   ├── App.jsx        # Main Logic & State Management
│   │   └── main.jsx       # Entry Point
│   └── tailwind.config.js # UI Configuration
├── data/                  # Mock Database
│   ├── tickets.json       # Active Ticket Queue
│   └── knowledge_base.json# Technical Solutions
├── index.js               # Express Backend & Logic Engine
├── package.json           # Backend dependencies
└── README.md              # Project Documentation
🛡️ IT Protocol & Best Practices
This project adheres to several professional software engineering standards:

CORS Policy: Secure cross-origin resource sharing between the UI and API.

Git Integrity: Utilizes .gitignore to prevent the leakage of node_modules and local system logs.

State Management: Uses React Hooks (useState, useEffect) to ensure a reactive and bug-free user experience.

👨‍💻 Developer
Miguel Adrienne Corachea