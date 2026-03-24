# HIOS - Learning Management System

A full-stack LMS built with **Next.js (App Router)**, **MongoDB**, **Razorpay**, and **Cloudinary**.

---

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the project root and add the following:

```env
# ─── MongoDB ───
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>

# ─── JWT ───
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_ACCESS_EXPIRES_IN=15d
JWT_REFRESH_EXPIRES_IN=7d

# ─── Cloudinary (Image/Video Uploads) ───
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ─── Razorpay (Payments) ───
RAZZER_PAY_KEY_ID=your_razorpay_key_id
RAZZER_PAY_KEY_SECRET=your_razorpay_key_secret

# ─── SMTP (Email) ───
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=Your App Name <your_email@gmail.com>
SMTP_VERIFY_EMAIL=admin_verify_email@gmail.com

# ─── Public (Accessible in Browser) ───
NEXT_PUBLIC_API_URL=/api
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Tech Stack

| Layer       | Technology                  |
|-------------|-----------------------------|
| Framework   | Next.js 14 (App Router)     |
| Database    | MongoDB + Mongoose          |
| Auth        | JWT (Access + Refresh)      |
| Payments    | Razorpay                    |
| Uploads     | Cloudinary                  |
| Styling     | Tailwind CSS + CSS Modules  |
| Animations  | Framer Motion               |

---

## Project Structure

```
src/
├── app/
│   ├── api/              # API route handlers
│   │   ├── auth/         # Register, OTP Verify, Login, Logout, Profile, Force Logout
│   │   ├── payment/      # Razorpay order, verify, failed
│   │   ├── enrollment/   # User course enrollment
│   │   ├── admin/        # Admin dashboard, categories, courses, modules, lessons
│   │   └── instructor/   # Instructor course & student management
│   └── dashboard/        # Dashboard pages (admin, instructor, student)
├── components/           # Reusable UI components
│   ├── common/           # ConfirmModal, AdminTable, Pagination, etc.
│   └── landing/          # Landing page components
├── models/               # Mongoose schemas (all in schemaModal.js)
├── services/             # Business logic (auth, payment, upload, etc.)
├── utils/                # JWT, password hashing, API response helpers
├── config/               # Database connection
└── middleware/            # Auth middleware
```

---

## Useful Commands

```bash
# Create a new folder with file
mkdir -p folderName && touch folderName/fileName
```
