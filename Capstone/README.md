# Capstone Project  

This project is a full-stack **gym class management application** that allows:  
- **Users** to create/cancel memberships and enroll/unenroll from classes.  
- **Admins** to create, edit, and delete classes, including updating the name, time, and attendee limit.  

---

## Features  

- 🔑 **Authentication** – Secure login for both Admins and Members.  
- 👤 **Membership Management** – Users can sign up, cancel, and manage their memberships.  
- 📅 **Class Enrollment** – Users can enroll in and unenroll from available classes.  
- 🛠 **Admin Tools** – Admins can create, edit, and delete classes, including setting the time, name, and attendee limit.  
- 📊 **Seed Data** – Preloaded admin, members, and classes for testing/demo.  

---

## Tech Stack  

**Frontend:**  
- React  
- JavaScript  
- Node.js (v20)  
- NPM  

**Backend:**  
- Python  
- Flask  
- SQLAlchemy  
- PostgreSQL  

---

## Getting Started  

You will need **two terminal windows** open: one for the backend and one for the frontend.  

- **Backend** runs on: `http://localhost:5000`  
- **Frontend** runs on: `http://localhost:3000`  

---

### Backend Setup  

1. Navigate to the backend directory:  
   ```bash
   cd Capstone/backend
   ```
2. Seed the database:
   ```bash
   python3 seed.py
   ```
3. Start the backend server:
   ```bash
   flask run
   ```
   or
   ```bash
   python3 app.py
   ```
   
### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd Capstone/frontend
   ```
2. Make sure you are using Node version 20 before starting:
   ```bash
   nvm use 20
   ```
3. Start the frontend server:
   ```bash
   npm start
   ```
   
The app will then start in your browser at `http://localhost:3000`.

### Seed Data

Running seed.py will populate the database with:
- **1 Admin**
- **2 Members**
- **3 Classes**

**Test Accounts**
Admin
- Email: admin@example.com
- Password: admin123

Member 1
- Email: member1@example.com
- Password: member123

Member 2
- Email: member2@example.com
- Password: member123
