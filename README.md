# DevConnect

A full-stack web application that allows developers to create profiles, showcase projects, and receive feedback from the community.

## 🚀 Tech Stack

**Frontend:**
- React 18
- Tailwind CSS
- React Router DOM
- Axios

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing

## 📋 Prerequisites

Before running this application, make sure you have the following installed:
- Node.js (version 18 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- Git

## 🛠️ Installation & Setup

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd devconnect
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory with the following variables:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/devconnect
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

### 4. Database Setup
Make sure MongoDB is running on your system, or update the `MONGODB_URI` in your `.env` file to point to your MongoDB Atlas cluster.

## 🚀 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
The backend server will start on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```
The frontend application will start on `http://localhost:3000`

## 📁 Project Structure

```
devconnect/
├── backend/
│   ├── config/          # Database and JWT configuration
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Authentication and validation middleware
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   └── server.js        # Express server setup
├── frontend/
│   ├── public/          # Static assets
│   └── src/
│       ├── components/  # React components
│       ├── pages/       # Page components
│       ├── context/     # React context
│       ├── services/    # API services
│       └── utils/       # Utility functions
└── README.md
```

## 🌟 Features

- [x] User authentication (signup/login)
- [x] User profiles with bio and skills
- [x] Project creation and management
- [x] Project browsing and search
- [x] Comment system for projects
- [x] Responsive design
- [x] Clean, modern UI

## 🚀 Deployment

**Frontend:** Deploy to Vercel or Netlify
**Backend:** Deploy to Render or Railway
**Database:** MongoDB Atlas

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.