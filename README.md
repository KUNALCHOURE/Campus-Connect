# Campus Connect

Campus Connect is a modern, full-stack web application designed to strengthen connections within the college community. It provides a platform for students, faculty, and alumni to engage, share opportunities, and collaborate effectively.

## 🌟 Features

- **Authentication System**: Secure login and registration using JWT
- **Interactive UI**: Modern, responsive design built with React and Tailwind CSS
- **Real-time Chat**: Integrated chat functionality for seamless communication
- **Resource Sharing**: Platform for sharing academic materials and projects
- **AI-Powered ChatBot**: Intelligent assistance using OpenAI integration
- **File Upload**: Support for document and media sharing
- **Protected Routes**: Secure access to authenticated content
- **Responsive Design**: Mobile-first approach for all devices

## 🛠️ Tech Stack

### Frontend
- React 18
- Vite
- React Router DOM
- Tailwind CSS
- Framer Motion (for animations)
- React Hot Toast (for notifications)
- Axios (for API calls)
- Firebase (for real-time features)
- Supabase (for authentication)

### Backend
- Node.js
- Express.js
- MongoDB (with Mongoose)
- JWT Authentication
- OpenAI Integration
- Multer (for file uploads)
- Cheerio (for web scraping)
- CORS enabled
- Cookie Parser

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/campusconnect.git
cd campusconnect
```

2. Install Frontend Dependencies
```bash
cd frontend
npm install
```

3. Install Backend Dependencies
```bash
cd ../Backend
npm install
```

4. Environment Setup
Create a `.env` file in the Backend directory with the following variables:
```env
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_api_key
```

### Running the Application

1. Start the Backend Server
```bash
cd Backend
npm start
```

2. Start the Frontend Development Server
```bash
cd frontend
npm run dev
```

The application will be available at `http://localhost:5173`

## 📁 Project Structure

```
campusconnect/
├── frontend/
│   ├── public/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── context/
│   │   │   └── utils/
│   │   ├── package.json
│   │   └── vite.config.js
│   │
│   └── Backend/
│       ├── controllers/
│       ├── models/
│       ├── routes/
│       ├── middlewares/
│       ├── utils/
│       ├── scraper/
│       └── app.js
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.
