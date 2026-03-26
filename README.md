
This web app requires authentication so use these emails only and passwrod is same for all which is "demo123".

Emails : for contractor : contractor@infratrust.com
        for citizen : citizen@infratrust.com
        for admin : admin@infratrust.com
        
# 🚧 InfraTrust — Transparent Infrastructure Monitoring System

InfraTrust is a smart infrastructure monitoring platform designed to bring **transparency, accountability, and trust** to public road construction projects.
The system tracks the entire lifecycle of construction materials — from factory dispatch to road construction — using digital records, GPS tracking, and automated trust scoring.

The goal is to **reduce corruption, prevent material theft, and ensure high-quality road construction**.

---

# 🌍 Problem

Public infrastructure projects often suffer from:

• Material theft or under-delivery
• Lack of real-time monitoring
• Poor accountability of contractors
• No transparent system for citizens to verify road construction quality

This leads to **poor roads, wasted government funds, and public distrust**.

---

# 💡 Solution

InfraTrust introduces a **digital material tracking and verification system** that monitors road construction in real time.

Key ideas:

* Every material request is digitally recorded
* Materials are assigned **Material Passports**
* Trucks carrying materials are **GPS tracked**
* QR codes verify authenticity of deliveries
* Contractors receive **trust scores** based on performance

This creates a **tamper-resistant digital audit trail**.

---

# ⚙️ Core Features

## 1️⃣ AI-Locked Project Planning

Road projects are created using geographic coordinates and construction parameters.

The system automatically calculates:

* required materials
* estimated cost
* construction specifications

These values are **locked**, preventing manipulation later.

---

## 2️⃣ Material Request System

Contractors must digitally request materials for a project.

Each request includes:

* project ID
* material type
* quantity
* requested delivery date

Requests are **approved or rejected by administrators**.

---

## 3️⃣ Material Passports

Once approved, the system generates a **Material Passport** containing:

* project ID
* material type
* factory name
* truck ID
* QR verification code

This passport travels with the material shipment.

---

## 4️⃣ Truck GPS Tracking

Drivers update location data during delivery.

This allows:

* real-time truck tracking
* route verification
* delivery monitoring

---

## 5️⃣ Contractor Trust Score

Contractors are assigned a **trust score** based on performance.

Factors affecting the score:

* completed projects
* citizen complaints
* delivery issues
* compliance with material requirements

Low scores flag contractors for investigation.

---

# 🏗 System Architecture

InfraTrust uses a **modern web architecture**:

Frontend
React + TypeScript

Backend
Node.js + Express

Database
SQLite (better-sqlite3)

Authentication
JWT Token Based Authentication

---

# 📊 Database Design

Main tables include:

* users
* projects
* boq (Bill of Quantities)
* material_requests
* material_passports
* deliveries
* truck_tracking
* contractor_scores

These tables form a **complete infrastructure monitoring system**.

---

# 👥 User Roles

InfraTrust supports four roles:

ADMIN
Creates projects and approves material requests.

CONTRACTOR
Requests materials and manages construction.

DRIVER
Updates truck location during delivery.

CITIZEN
Can view project transparency data.

---

# 🚀 How to Run the Project

## 1️⃣ Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/InfraTrust---Hackathon.git
cd InfraTrust---Hackathon
```

---

## 2️⃣ Install Dependencies

```bash
npm install
```

---

## 3️⃣ Start Development Server

```bash
npm run dev
```

Server will start on:

```
http://localhost:3000
```

---

# 🧪 Test Accounts

Admin

email: [admin@infratrust.com](mailto:admin@infratrust.com)
password: password123

Contractor

email: [contractor@infratrust.com](mailto:contractor@infratrust.com)
password: password123

---

# 🔐 Security Features

InfraTrust includes:

* JWT authentication
* role-based access control
* database constraints
* tamper-resistant records

---

# 🌟 Future Improvements

Possible upgrades:

• Blockchain-based material verification
• AI corruption detection system
• Satellite verification of road construction
• Citizen mobile reporting app
• Government dashboard for national infrastructure monitoring

---

# 🏆 Hackathon Vision

InfraTrust aims to demonstrate how **technology can improve transparency in public infrastructure projects**.

The system shows how digital tracking, automated scoring, and data transparency can significantly **reduce corruption and improve construction quality**.

---

# 👨‍💻 Author

Jaynil Baman
Computer Science Student

---

# 📜 License

This project was created for educational and hackathon purposes.

Here are some of pictures of our working app : 

1. Log in Page
<img width="1670" height="844" alt="image" src="https://github.com/user-attachments/assets/0562a5c5-6939-4424-8365-8073f3048d64" />
2. Citizens can see all the details of the project and also they can see how much money is to be used on which project and when the project is started and when it is supposed to finish.
   <img width="1886" height="852" alt="image" src="https://github.com/user-attachments/assets/eaa37c3a-a4f4-43b4-bdfe-b00800f83303" />
3.Citizens can report a issue regarding the road which will be directly visible to the Admin/PWD.
<img width="1880" height="868" alt="image" src="https://github.com/user-attachments/assets/e051ad8c-297c-4245-8dff-486c40960116" />
4. The below is admin's dashboard. Uploading all the screenshots regarding this is very difficult for our team so we are just upload one screenshot for overview, although it is suggested to clone this repo and use npm modules to run it on your system.
   <img width="1887" height="857" alt="image" src="https://github.com/user-attachments/assets/c98e7ea2-7bb6-4047-8612-361b9d5c19ff" />



