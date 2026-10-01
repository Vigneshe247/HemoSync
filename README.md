# NeoBlood — Smart Blood Donation & Emergency Hospital Network

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ESNext-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**NeoBlood** is a modern, responsive, and user-friendly web application designed to connect voluntary blood donors with hospitals, blood banks, and patients during critical emergencies. Built with React and Vite JavaScript, it delivers real-time search, interactive compatibility charts, donor eligibility checks, and instant dispatch boards.

---

## 🌟 Key Features

### 1. 🩸 Emergency Dispatch & Requests Board
- **Instant Broadcast**: Patients, family members, and medical staff can post emergency blood requests (Units needed, Hospital name, Address, Urgency level, Required date).
- **Critical Alerts**: Visual pulsing beacons and tickers highlight urgent needs (e.g. Critical O- trauma units).
- **Direct Donation Pledges**: Donors can pledge to donate blood for specific patients with instant confirmation and celebration feedback.
- **Fulfillment Tracking**: Requests can be marked as fulfilled once donations are completed.

### 2. 👥 Verified Donors Directory
- **Multi-Filter Navigation**: Filter donors by Blood Group (`A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-`), City, or Name.
- **Real-Time Availability**: Donors can toggle their active availability status on or off with a single click.
- **Direct Donor Messaging**: Send immediate emergency requests directly to compatible donors with custom notes.
- **Safe Contact Revealing**: Auth-guarded contact cards to protect donor privacy.

### 3. 🏥 Regional Blood Banks & Live Inventory
- **Real-Time Reserves Matrix**: Live unit counts across regional medical centers and Red Cross hubs.
- **Low Stock Warnings**: Visual alerts for critical blood supply shortages (< 3 units).
- **Hotline & Operating Hours**: Direct phone dispatch lines and 24/7 operating schedules.

### 4. 🔬 Interactive Blood Compatibility Matrix
- **Cross-Matching Engine**: Select any blood type to dynamically view:
  - Who you can safely donate red blood cells to.
  - Who you can safely receive red blood cells from.
  - Universal donor (`O-`) and universal recipient (`AB+`) visual highlights.

### 5. 📋 4-Step Eligibility Quiz
- Interactive health and eligibility screening (Age, Weight, Recent donations, Health status).
- Instant determination if you can safely donate whole blood today.

### 6. 👤 Donor & User Dashboard
- **Lifesaver Profile**: View Donor ID, blood type pill, total donations, and estimated lives saved.
- **Availability Switch**: Toggle between "Available to Donate Now" and "Currently Unavailable".
- **Direct Inquiries Inbox**: Receive, view, and mark incoming emergency requests as read.
- **Profile Customization**: Update contact numbers, city, and donor weight easily.

### 7. 🏕️ Community Drives & Support
- Upcoming mobile blood drives and college camps schedule with one-click registration.
- Frequently Asked Questions (FAQ) accordion for first-time donors.
- 24/7 Emergency Transfusion Helpline information.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm`

### Installation

1. Clone the repository:
```bash
git clone https://github.com/SRIDHARAN-A590/Blood-Donation-System.git
cd Blood-Donation-System
```

2. Install dependencies:
```bash
npm install
```

3. Launch development server:
```bash
npm run dev
# or
npm start
```
The application will be live at `http://localhost:3000/`.

---

## 🛠️ Build & Production

To compile an optimized production bundle:
```bash
npm run build
```
Production assets will be generated in the `dist/` directory.

To preview the production build locally:
```bash
npm run preview
```

---

## 🔑 Demo Account Credentials

For instant demonstration and testing, use the **Auto-Fill** button on the Login page:
- **Email**: `john.doe@gmail.com`
- **Password**: `Password123!`
- **Role**: Verified O+ Volunteer Donor

---

## 📁 Project Architecture

```
blood-donation-system/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── Navbar.jsx              # Navigation and header
│   │   ├── Footer.jsx              # Footer and links
│   │   ├── CompatibilityMatrix.jsx # Educational blood chart
│   │   ├── EligibilityModal.jsx    # Interactive eligibility quiz
│   │   └── RequestModal.jsx        # Direct donor messaging dialog
│   ├── context/            # Global state providers
│   │   ├── AuthContext.jsx         # User authentication & seed profiles
│   │   ├── DataContext.jsx         # Blood requests, banks & camps state
│   │   └── ToastContext.jsx        # Toast notification system
│   ├── pages/              # Main view screens
│   │   ├── LandingPage.jsx         # Hero, stats, pillars & matrix
│   │   ├── DonorsPage.jsx          # Searchable donor directory
│   │   ├── RequestBloodPage.jsx    # Emergency dispatch board & form
│   │   ├── BloodBanksPage.jsx      # Hospital inventory & stock levels
│   │   ├── DashboardPage.jsx       # Donor profile & inbox
│   │   ├── LoginPage.jsx           # Sign in with 1-click demo
│   │   ├── RegisterPage.jsx        # Donor signup with eligibility checks
│   │   └── ContactPage.jsx         # Drives, FAQs & inquiry form
│   ├── styles/
│   │   └── index.css               # Vanilla CSS design tokens & animations
│   ├── App.jsx             # Main container & hash routing
│   └── main.jsx            # React root entry point
├── index.html              # HTML5 root with Google Fonts
├── package.json            # Project manifest & scripts
├── vite.config.js          # Vite configuration
└── README.md               # Documentation
```

---

## 📄 License
This project is licensed under the MIT License.
# HemoSync
