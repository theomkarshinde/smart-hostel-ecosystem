# Smart Hostel Ecosystem

A comprehensive ecosystem for managing hostel operations, featuring modules for Admins, Wardens, Guards, and Students.

## 🚀 Tech Stack

- **Backend:** Java, Spring Boot, Spring Security, JWT, JPA/Hibernate, MySQL
- **Frontend:** React, Vite, Tailwind CSS, Lucide Icons
- **Integrations:** Razorpay (Payments), Gmail SMTP (Notifications)

## 🛠️ Project Structure

```text
/smart-hostel-ecosystem
├── /backend   # Spring Boot Application
├── /frontend  # Vite + React Application
└── README.md  # Project Documentation
```

## ⚙️ Setup Instructions

### 1. Database Setup
1. Create a MySQL database named `smart_hostel`.
2. Import your database schema (SQL import).
   from database folder names `smart_hostel.sql`
3. This file contains all table structures, role definitions, and a default **admin** user (password: `password`).
4. You can use this file to quickly set up a fresh database

### 2. Backend Configuration
1. Navigate to the `backend` folder.
2. Locate `.env.example` and create a new file named `.env`.
3. Fill in your credentials:
   - Database username/password
   - SMTP credentials (for email notifications)
   - JWT secret key
   - Razorpay Key ID and Secret
4. Run the application: `./mvnw spring-boot:run`

### 3. Frontend Configuration
1. Navigate to the `frontend` folder.
2. Locate `.env.example` and create a new file named `.env`.
3. Add your configuration:
   - `VITE_RAZORPAY_KEY_ID=your_key_here`
   - `VITE_API_URL=your_api_url_here` (e.g., http://localhost:8084/v1/api)
   - `VITE_WS_URL=your_ws_url_here` (e.g., ws://localhost:8084/ws)
4. Install dependencies: `npm install`
5. Run the development server: `npm run dev`

## 🔒 Security Note
The `.env` files are excluded from Git via `.gitignore` to protect your sensitive credentials. Always use the `.env.example` as a template when setting up a new environment.

## 📄 License
This project is for educational/internal use.
