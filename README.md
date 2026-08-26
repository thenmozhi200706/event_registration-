# EventSphere

## Smart Event Registration & Management Platform

EventSphere is a full-stack event registration and management platform built using the **MERN Stack** — MongoDB, Express.js, React.js, and Node.js.

The application provides separate role-based functionality for:

* **Admin**
* **Organizer**
* **Participant/User**

It manages the complete event lifecycle, including event creation, event discovery, participant registration, payment processing, registration confirmation, and event-wise registration management.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Main Features](#main-features)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [System Workflow](#system-workflow)
6. [Requirements](#requirements)
7. [Installation](#installation)
8. [Backend Setup](#backend-setup)
9. [Frontend Setup](#frontend-setup)
10. [Environment Variables](#environment-variables)
11. [Database Setup](#database-setup)
12. [Authentication](#authentication)
13. [Email and OTP Setup](#email-and-otp-setup)
14. [Payment Setup](#payment-setup)
15. [Running the Project](#running-the-project)
16. [Application Roles](#application-roles)
17. [API Overview](#api-overview)
18. [Event Registration Flow](#event-registration-flow)
19. [Troubleshooting](#troubleshooting)
20. [Production Build](#production-build)
21. [Future Improvements](#future-improvements)
22. [Conclusion](#conclusion)

---

# Project Overview

EventSphere replaces manual event registration systems such as Google Forms and spreadsheet-based registration management with a centralized web application.

The system allows administrators to manage organizers, organizers to create and manage events, and participants to browse and register for events.

The application is designed around a role-based architecture.

### Admin

The Admin manages the overall platform and organizers.

### Organizer

The Organizer creates and manages their own events and views registered participants.

### Participant

The Participant browses events, enters registration information, completes payment where required, and receives registration confirmation.

---

# Main Features

## Admin Features

* Admin authentication
* Admin dashboard
* Organizer management
* Add organizers
* Organizer OTP verification
* Enable/disable organizer accounts
* View overall event statistics
* View registration statistics
* View event-wise registration information
* Monitor platform activity

---

## Organizer Features

* Organizer authentication
* Organizer dashboard
* Create events
* Edit events
* Delete/close events
* Upload event images
* Add event descriptions
* Add event hashtags
* Add venue information
* Configure event date and time
* Configure registration fee
* View event registrations
* Search registered participants
* Manage owned events

---

## Participant/User Features

* User authentication
* Browse available events
* View event details
* Search/discover events
* View event image/banner
* Register for an event
* Enter participant details
* Complete payment for paid events
* View registration information
* Receive registration confirmation

---

# Technology Stack

## Frontend

* React.js
* Vite
* Axios
* React Router
* CSS / Tailwind CSS
* Razorpay Checkout integration

## Backend

* Node.js
* Express.js
* REST API
* JWT/authentication middleware
* Role-based authorization

## Database

* MongoDB
* Mongoose

## Authentication

* Google/Gmail authentication where configured
* Role-based authentication
* Protected routes
* Admin/Organizer/User authorization

## Email

* Nodemailer
* SMTP/Gmail configuration
* OTP verification
* Registration confirmation emails

## Payment

* Razorpay
* Payment order creation
* Payment verification
* Registration payment status management

---

# Project Structure

The project is divided into two main applications:

```text
EventSphere/
│
├── frontend/
│   │
│   ├── public/
│   │
│   ├── src/
│   │   ├── api/
│   │   │   └── api.js
│   │   │
│   │   ├── assets/
│   │   │
│   │   ├── components/
│   │   │
│   │   ├── pages/
│   │   │
│   │   ├── context/
│   │   │
│   │   ├── services/
│   │   │
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   ├── vite.config.js
│   └── ...
│
├── backend/
│   │
│   ├── config/
│   │
│   ├── controllers/
│   │
│   ├── middleware/
│   │
│   ├── models/
│   │
│   ├── routes/
│   │
│   ├── utils/
│   │
│   ├── server.js
│   ├── package.json
│   └── .env
│
└── README.md
```

> The exact filenames can differ depending on the final implementation. The important separation is between the React frontend and Node/Express backend.

---

# System Workflow

The complete EventSphere workflow is:

```text
                    ┌─────────────────┐
                    │      ADMIN      │
                    └────────┬────────┘
                             │
                             ▼
                  Add / Manage Organizer
                             │
                             ▼
                       OTP Verification
                             │
                             ▼
                    ┌─────────────────┐
                    │    ORGANIZER    │
                    └────────┬────────┘
                             │
                             ▼
                       Create Event
                             │
                             ▼
                    Event Published
                             │
                             ▼
                    ┌─────────────────┐
                    │   PARTICIPANT   │
                    └────────┬────────┘
                             │
                             ▼
                       Browse Event
                             │
                             ▼
                    Registration Form
                             │
                             ▼
                         Payment
                             │
                             ▼
                   Payment Verification
                             │
                             ▼
                   Registration Confirmed
                             │
                             ▼
                    Confirmation Email
                             │
                             ▼
                  Organizer/Admin Dashboard
```

---

# Requirements

Before installing EventSphere, make sure the following software is installed.

### Node.js

Install Node.js from:

https://nodejs.org/

Check installation:

```bash
node -v
```

```bash
npm -v
```

---

### MongoDB

You can use either:

* MongoDB Atlas
* Local MongoDB

For MongoDB Atlas, create a database cluster and obtain the MongoDB connection string.

Example:

```text
mongodb+srv://username:password@cluster.mongodb.net/EventSphere
```

---

### Git

Check Git:

```bash
git --version
```

---

# Installation

Clone the project:

```bash
git clone <YOUR_REPOSITORY_URL>
```

Move into the project:

```bash
cd EventSphere
```

The project contains separate frontend and backend applications.

---

# Backend Setup

Open a terminal and move into the backend directory:

```bash
cd backend
```

Install backend dependencies:

```bash
npm install
```

Create a `.env` file inside the backend directory:

```text
backend/
└── .env
```

Add the required configuration values.

Example:

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

CLIENT_URL=http://localhost:5173

EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

Use the exact variable names expected by the final backend implementation.

Do not commit `.env` to GitHub.

---

# Frontend Setup

Open another terminal.

Move into the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

The frontend communicates with the backend through the configured Axios API client.

The API base URL should point to the running backend.

For local development it will normally be:

```text
http://localhost:5000
```

or the backend API prefix configured by the project.

---

# Environment Variables

Environment variables are used to keep sensitive configuration outside the source code.

Typical backend configuration includes:

| Variable              | Purpose               |
| --------------------- | --------------------- |
| `PORT`                | Backend server port   |
| `MONGO_URI`           | MongoDB connection    |
| `JWT_SECRET`          | Authentication secret |
| `CLIENT_URL`          | Frontend URL          |
| `EMAIL_USER`          | Email account         |
| `EMAIL_PASS`          | Email app password    |
| `RAZORPAY_KEY_ID`     | Razorpay public key   |
| `RAZORPAY_KEY_SECRET` | Razorpay secret key   |

If Google authentication is enabled in the final implementation, the required Google OAuth variables should also be added according to the authentication configuration.

Example:

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=your_google_callback_url
```

Only add variables that are actually referenced by the backend implementation.

---

# Database Setup

EventSphere uses MongoDB as its database.

The main application data is organized around entities such as:

```text
Users
Organizers
Events
Registrations
Payments
```

A simplified relationship is:

```text
User
 │
 ├───────────────┐
 │               │
 ▼               ▼
Registration    Profile
 │
 ▼
Event
 │
 ▼
Organizer

Registration
 │
 ▼
Payment
```

---

# Authentication

EventSphere uses protected authentication and role-based authorization.

The system separates users into roles such as:

```text
admin
organizer
user
```

Protected backend routes use authentication middleware.

Role-specific routes use authorization middleware to prevent unauthorized users from accessing restricted functionality.

For example:

```text
Admin
 ├── Admin Dashboard
 ├── Organizer Management
 └── Platform Statistics

Organizer
 ├── Organizer Dashboard
 ├── Create Event
 ├── Edit Event
 └── View Registrations

User
 ├── Events
 ├── Event Details
 ├── Registration
 └── Payment
```

---

# Email and OTP Setup

Organizer onboarding can use an OTP verification process.

The basic flow is:

```text
Admin adds organizer
        ↓
OTP generated
        ↓
OTP sent to organizer email
        ↓
Organizer enters OTP
        ↓
OTP verified
        ↓
Organizer account activated
```

For Gmail SMTP, use an **App Password** rather than your normal Gmail password when required by the account configuration.

Example:

```env
EMAIL_USER=example@gmail.com
EMAIL_PASS=your_app_password
```

Never publish real email passwords or API secrets in the repository.

---

# Payment Setup

EventSphere uses Razorpay for paid event registration where enabled.

The payment flow is:

```text
Participant
     │
     ▼
Registration Form
     │
     ▼
Create Razorpay Order
     │
     ▼
Razorpay Checkout
     │
     ▼
Payment
     │
     ▼
Payment Verification
     │
     ▼
Registration Status = Paid
     │
     ▼
Confirmation
```

Required configuration:

```env
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
```

For production, configure the appropriate Razorpay webhook and payment credentials according to the final deployment environment.

---

# Running the Project

EventSphere requires both the backend and frontend servers to run.

## Step 1 — Start Backend

Open Terminal 1:

```bash
cd EventSphere/backend
```

Install dependencies if not already installed:

```bash
npm install
```

Start the backend using the script configured in `package.json`.

Common development command:

```bash
npm run dev
```

If the project does not define a `dev` script, use the start script defined in `package.json`, for example:

```bash
npm start
```

The backend should start on:

```text
http://localhost:5000
```

The exact port is controlled by the `PORT` environment variable.

---

## Step 2 — Start Frontend

Open Terminal 2:

```bash
cd EventSphere/frontend
```

Install dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

Vite normally displays a URL similar to:

```text
http://localhost:5173
```

Open the displayed URL in your browser.

---

# Running Both Servers

You should have two terminals running.

### Terminal 1

```bash
cd EventSphere/backend
npm run dev
```

### Terminal 2

```bash
cd EventSphere/frontend
npm run dev
```

Then open the frontend URL shown by Vite.

Example:

```text
Frontend:
http://localhost:5173

Backend:
http://localhost:5000
```

---

# Application Roles

## 1. Admin

The Admin is responsible for platform-level management.

Admin can:

* Access the Admin Dashboard
* Manage organizers
* Add organizers
* Verify organizer onboarding
* Monitor events
* Monitor registrations
* View platform statistics

---

## 2. Organizer

The Organizer manages their own events.

Organizer can:

* Access Organizer Dashboard
* Create events
* Upload event images
* Add event details
* Edit events
* Delete/close events
* View registered participants
* Search registration records

---

## 3. Participant/User

Participants interact with the public event system.

Participant can:

* Login
* Browse events
* View event details
* Register for events
* Enter personal/institution information
* Complete payment when required
* View registration information
* Receive confirmation

---

# API Overview

The application follows a REST API architecture.

Representative API functionality includes:

## Authentication

```text
POST /api/auth/...
```

Used for authentication and login functionality.

---

## Organizer Management

```text
POST /api/admin/organizers
```

Used by Admin to add an organizer.

---

## OTP Verification

```text
POST /api/organizer/verify-otp
```

Used to verify organizer OTP where implemented.

---

## Events

```text
POST /api/events
```

Create an event.

```text
GET /api/events
```

Retrieve events.

```text
PUT /api/events/:id
```

Update an event.

```text
DELETE /api/events/:id
```

Delete/close an event.

---

## Registrations

```text
POST /api/registrations
```

Create a registration.

```text
GET /api/registrations/...
```

Retrieve registration information.

```text
DELETE /api/registrations/...
```

Cancel a registration where supported.

---

## Payments

```text
POST /api/payments/create-order
```

Create a payment order.

```text
POST /api/payments/webhook
```

Process payment gateway webhook events where configured.

---

# Event Registration Flow

The complete participant registration process is:

### Step 1

Participant opens the Events page.

### Step 2

Participant selects an event.

### Step 3

The Event Details page displays information such as:

* Event title
* Description
* Event image
* Hashtags
* Venue
* Date
* Registration fee
* Registration information

### Step 4

Participant clicks the registration option.

### Step 5

Participant enters required details.

Typical information includes:

```text
First Name
Last Name
Age
WhatsApp Number
Email
College / School
Department
Year
```

### Step 6

For paid events, the payment process is started.

### Step 7

The payment gateway processes the payment.

### Step 8

The backend verifies the payment.

### Step 9

The registration payment status is updated.

Example:

```text
pending
   ↓
paid
```

or, if unsuccessful:

```text
pending
   ↓
failed
```

### Step 10

The participant receives registration confirmation where email functionality is configured.

### Step 11

The registration becomes available to the appropriate Organizer/Admin dashboard.

---

# Security

The application uses several security mechanisms.

## Authentication

Protected routes require authenticated access.

## Role Authorization

Users cannot access dashboards belonging to another role.

## Environment Variables

Sensitive credentials are stored outside the source code.

## Payment Verification

Payment information should be verified on the backend rather than trusting frontend payment status.

## Protected API Routes

Sensitive APIs use authentication and authorization middleware.

---

# Important `.gitignore`

The following files should not be committed:

```text
node_modules/
.env
.env.local
dist/
build/
```

A typical `.gitignore` should contain:

```gitignore
node_modules/
.env
.env.*
dist/
build/
```

Do not upload API keys, database passwords, JWT secrets, email passwords, or payment secrets to GitHub.

---

# Troubleshooting

## 1. `npm install` fails

Delete `node_modules` and reinstall:

```bash
rm -rf node_modules
npm install
```

On Windows Command Prompt:

```cmd
rmdir /s /q node_modules
npm install
```

---

## 2. Port 5000 is already in use

The backend port is already being used by another application.

Stop the process using the port or change:

```env
PORT=5000
```

to another available port.

For example:

```env
PORT=5001
```

If the backend port changes, make sure the frontend API configuration also points to the new backend URL.

---

## 3. MongoDB connection error

Check:

```text
MONGO_URI
```

Make sure:

* MongoDB is running if using local MongoDB.
* The MongoDB Atlas cluster is active.
* The username is correct.
* The password is correct.
* The database user has permission.
* Your IP address is allowed in MongoDB Atlas.

---

## 4. Frontend cannot connect to backend

Check that both servers are running.

Backend:

```text
http://localhost:5000
```

Frontend:

```text
http://localhost:5173
```

Also verify the Axios/base API URL configuration.

---

## 5. Email is not being sent

Check:

```env
EMAIL_USER
EMAIL_PASS
```

If Gmail SMTP is being used, verify that the account is configured correctly and that an appropriate App Password is being used where required.

Also check the backend terminal for Nodemailer errors.

---

## 6. Razorpay payment is not working

Check:

```env
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
```

Also verify:

* Razorpay credentials
* Frontend Razorpay configuration
* Backend order creation
* Payment verification
* Webhook configuration where applicable

---

## 7. CORS error

Make sure the backend allows requests from the frontend URL.

For local development, the frontend is normally:

```text
http://localhost:5173
```

Check the backend CORS configuration and `CLIENT_URL`.

---

## 8. Blank React page

Check the browser Developer Tools:

```text
F12 → Console
```

Look for:

* Import errors
* Routing errors
* API errors
* JavaScript errors

Also check the Vite terminal.

---

# Production Build

Before deploying the application, create a production frontend build.

From the frontend directory:

```bash
npm run build
```

This generates the production build.

The backend should also be configured with production environment variables.

Production configuration should use:

```text
Production MongoDB
Production frontend URL
Production backend URL
Production payment credentials
Production email configuration
```

Do not use development secrets in production.

---

# Deployment Architecture

A typical production architecture is:

```text
                  Internet
                     │
                     ▼
            ┌─────────────────┐
            │ React Frontend  │
            │ Vercel/Netlify  │
            └────────┬────────┘
                     │
                     │ REST API
                     ▼
            ┌─────────────────┐
            │ Node + Express  │
            │ Backend Server  │
            └────────┬────────┘
                     │
              ┌──────┴───────┐
              │              │
              ▼              ▼
        ┌──────────┐   ┌────────────┐
        │ MongoDB  │   │  Razorpay  │
        │  Atlas   │   │  Payments  │
        └──────────┘   └────────────┘
```

The original EventSphere architecture is based on a React frontend, Node/Express backend, MongoDB/Mongoose database, email/OTP services, file storage, and payment gateway integration.

---

# Development Commands

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Production build:

```bash
npm run build
```

---

## Backend

```bash
cd backend
npm install
npm run dev
```

Or use the start command defined in the backend `package.json`:

```bash
npm start
```

---

# Quick Start

For a new installation:

```bash
git clone <YOUR_REPOSITORY_URL>

cd EventSphere
```

### Terminal 1

```bash
cd backend
npm install
```

Configure:

```text
.env
```

Then:

```bash
npm run dev
```

### Terminal 2

```bash
cd frontend
npm install
npm run dev
```

Open the URL provided by Vite.

---

# Recommended First-Time Testing

After starting the project, test the application in this order:

```text
1. Start MongoDB
        ↓
2. Start Backend
        ↓
3. Start Frontend
        ↓
4. Open Application
        ↓
5. Test Authentication
        ↓
6. Test Admin Dashboard
        ↓
7. Add/verify Organizer
        ↓
8. Login as Organizer
        ↓
9. Create Event
        ↓
10. Open Event as Participant
        ↓
11. Register
        ↓
12. Test Payment
        ↓
13. Verify Registration
        ↓
14. Check Organizer Dashboard
        ↓
15. Check Admin Dashboard
```

---

# Data Flow

The general application data flow is:

```text
React Frontend
      │
      │ Axios HTTP Request
      ▼
Express REST API
      │
      ├── Authentication Middleware
      │
      ├── Role Authorization
      │
      ├── Controller
      │
      ▼
Mongoose Model
      │
      ▼
MongoDB
```

For payment:

```text
React
  │
  ▼
Backend
  │
  ▼
Razorpay
  │
  ▼
Payment Result
  │
  ▼
Backend Verification
  │
  ▼
MongoDB Registration
```

---

# Database Entities

The EventSphere architecture uses the following major data entities.

## Users

Stores participant/user account information.

Typical fields include:

```text
_id
name
email
googleId
whatsappNumber
age
instituteName
department
year
role
createdAt
```

---

## Organizers

Stores organizer information and onboarding status.

Typical fields include:

```text
_id
name
email
otpCode
otpVerified
isActive
addedByAdminId
createdAt
```

---

## Events

Stores event information.

Typical fields include:

```text
_id
title
description
hashtags
bannerImageUrl
organizerId
venue
eventDate
registrationFee
registrationDeadline
status
createdAt
updatedAt
```

---

## Registrations

Stores participant registration information.

Typical fields include:

```text
_id
eventId
userId
firstName
lastName
age
whatsappNumber
email
instituteName
department
year
paymentStatus
paymentId
registeredAt
```

---

## Payments

Stores payment information.

Typical fields include:

```text
_id
registrationId
orderId
amount
currency
gatewayResponse
status
paidAt
```

---

# Project Benefits

EventSphere provides:

* Centralized event management
* Role-based access
* Automated registration
* Digital payment processing
* Registration tracking
* Organizer management
* Participant management
* Email communication
* Reduced manual data entry
* Better event monitoring
* Scalable MERN architecture

---

# Future Improvements

Possible future improvements include:

* QR-code based event tickets
* QR attendance scanning
* Advanced analytics
* Automated certificate generation
* WhatsApp notifications
* Event waitlists
* Automatic waitlist promotion
* Refund management
* Organizer verification badges
* Duplicate registration prevention
* Admin broadcast messages
* CSV/PDF report generation
* Multi-event/fest passes
* Push notifications
* AI-assisted duplicate/fraud detection
* College ERP/LMS integration

These improvements are part of the broader EventSphere roadmap and can be implemented incrementally.

---

# Academic Project Information

**Project Name:** EventSphere

**Project Type:** Full-Stack Web Application

**Architecture:** MERN Stack

**Frontend:** React + Vite

**Backend:** Node.js + Express.js

**Database:** MongoDB

**Authentication:** Role-Based Authentication / Google Authentication where configured

**Payment Gateway:** Razorpay

**Email Service:** Nodemailer / SMTP

---

# Conclusion

EventSphere is a complete event registration and management platform designed to simplify the process of creating, publishing, registering for, and managing events.

The application separates responsibilities between Admins, Organizers, and Participants while providing a centralized backend and database.

The system demonstrates the practical use of:

* React
* Vite
* Node.js
* Express.js
* MongoDB
* Mongoose
* REST APIs
* Authentication
* Role-based authorization
* Email/OTP verification
* Payment integration
* Event management
* Registration management

The project can be developed further into a production-ready event management platform by adding advanced analytics, QR-based attendance, certificates, notifications, waitlists, and additional integrations.

---

## Author

**EventSphere — MERN Stack Event Registration & Management Platform**

Built as a full-stack academic/project application using modern web technologies.
