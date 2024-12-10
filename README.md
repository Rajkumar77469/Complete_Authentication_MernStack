MERN Stack Authentication Project


A complete authentication system built with the MERN stack (MongoDB, Express, React, Node.js). The system includes the following features:


User registration with username, email, and password.
Email verification via OTP.
Login and logout functionality.
Password reset using OTP.
Features
User Registration
Users can register with their username, email, and password. An OTP is sent to their email for verification.



Email Verification

Users must verify their email using the OTP sent to complete registration.



Login

Registered users can log in with their email and password.

Logout

Users can log out securely.

Password Reset

If a user forgets their password, they can request an OTP via email and reset their password.

Technologies Used

Frontend: React, Axios
Backend: Node.js, Express
Database: MongoDB
Authentication: JSON Web Tokens (JWT) and OTP for email verification


Setup Instructions

Prerequisites

Ensure you have the following installed:

Node.js
MongoDB
A mail service setup (e.g., Gmail) for sending OTPs
Backend Setup
Clone the repository:

bash
Copy code
git clone <repository-url>
cd mern-authentication-backend
Install dependencies:

bash
Copy code
npm install
Create a .env file in the root directory and add the following variables:

env
Copy code
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
Start the backend server:

bash
Copy code
npm start
Frontend Setup
Navigate to the frontend directory:

bash
Copy code
cd ../mern-authentication-frontend
Install dependencies:

bash
Copy code
npm install
Update the API base URL in src/config.js if needed.

Start the frontend development server:

bash
Copy code
npm start
Usage
Register a new account by providing a username, email, and password.
Check your email for the OTP and verify your account.
Log in to access protected resources.
If you forget your password, request an OTP to reset it.
