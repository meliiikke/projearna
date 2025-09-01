# ARNA Energy Website

Modern, responsive energy company website with admin panel for content management. Built with React frontend and Node.js backend.

![ARNA Energy](https://img.shields.io/badge/ARNA-Energy-gold)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-Backend-green)
![MySQL](https://img.shields.io/badge/MySQL-Database-orange)

## 🌟 Features

### Frontend Website
- **Modern Design**: Professional, responsive design similar to industrial/energy companies
- **Hero Section**: Animated hero with call-to-action
- **About Section**: Company information with features
- **Services**: Dynamic services showcase
- **Statistics**: Interactive company statistics with world map
- **Contact**: Company contact information
- **Responsive**: Mobile-first responsive design

### Admin Panel
- **Secure Login**: JWT-based authentication
- **Content Management**: Edit all website sections
- **Services Management**: Add, edit, delete services
- **Statistics Management**: Manage company statistics
- **Contact Management**: Update contact information
- **Real-time Updates**: Changes reflect immediately

### Backend API
- **RESTful API**: Clean API endpoints
- **MySQL Database**: Structured data storage
- **Authentication**: JWT token-based auth
- **Security**: Helmet, CORS, rate limiting
- **Auto-initialization**: Database tables created automatically

## 🛠️ Technology Stack

- **Frontend**: React 18, React Router, Framer Motion, Axios
- **Backend**: Node.js, Express.js, MySQL2, JWT
- **Database**: MySQL
- **Styling**: CSS3, Flexbox, Grid
- **Security**: Helmet, CORS, bcryptjs

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MySQL Server
- npm or yarn

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd arna-energy-website

# Install root dependencies
npm install

# Install all dependencies (backend + frontend)
npm run install-all
```

### 2. Database Setup

1. **Install MySQL** if not already installed
2. **Start MySQL Server**
3. **Create Database** (optional - will be created automatically):
   ```sql
   CREATE DATABASE arna_energy;
   ```

### 3. Environment Configuration

Create a `.env` file in the `backend` directory:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=arna_energy

# JWT Secret (Change in production!)
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production

# Server Configuration
PORT=3001
NODE_ENV=development
```

### 4. Start the Application

```bash
# Start both backend and frontend concurrently
npm run dev

# Or start separately:
# Backend (http://localhost:3001)
npm run server

# Frontend (http://localhost:3000)  
npm run client
```

## 🚀 Usage

### Accessing the Website
- **Main Website**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin/login

### Default Admin Credentials
- **Username**: `admin`
- **Password**: `admin123`

⚠️ **Important**: Change these credentials immediately after first login!

### Admin Panel Features

1. **Content Sections**: 
   - Edit hero section content
   - Modify about section
   - Update mission statements

2. **Services Management**:
   - Add new services
   - Edit existing services
   - Delete services
   - Reorder services

3. **Statistics Management**:
   - Add company statistics
   - Edit values and descriptions
   - Toggle active/inactive

4. **Contact Information**:
   - Update phone, email, address
   - Modify working hours

## 🏗️ Project Structure

```
arna-energy-website/
├── backend/
│   ├── config/
│   │   └── database.js          # Database configuration
│   ├── middleware/
│   │   └── auth.js              # Authentication middleware
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   └── content.js           # Content management routes
│   ├── package.json
│   └── server.js                # Main server file
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   └── logo.png
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/           # Admin panel components
│   │   │   ├── Header.js        # Site header
│   │   │   ├── Hero.js          # Hero section
│   │   │   ├── About.js         # About section
│   │   │   ├── Services.js      # Services section
│   │   │   ├── Statistics.js    # Statistics section
│   │   │   └── Footer.js        # Site footer
│   │   ├── contexts/
│   │   │   └── AuthContext.js   # Authentication context
│   │   ├── pages/
│   │   │   ├── Home.js          # Main website
│   │   │   ├── AdminLogin.js    # Admin login
│   │   │   └── AdminDashboard.js # Admin dashboard
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── package.json                 # Root package.json
└── README.md
```

## 🔧 API Endpoints

### Public Endpoints
- `GET /api/content/sections` - Get all content sections
- `GET /api/content/sections/:sectionName` - Get specific section
- `GET /api/content/services` - Get all services
- `GET /api/content/statistics` - Get all statistics
- `GET /api/content/contact` - Get contact information

### Admin Endpoints (Protected)
- `POST /api/auth/login` - Admin login
- `GET /api/auth/me` - Get current admin info
- `PUT /api/content/admin/sections/:id` - Update content section
- `POST /api/content/admin/services` - Create service
- `PUT /api/content/admin/services/:id` - Update service
- `DELETE /api/content/admin/services/:id` - Delete service
- `POST /api/content/admin/statistics` - Create statistic
- `PUT /api/content/admin/statistics/:id` - Update statistic
- `DELETE /api/content/admin/statistics/:id` - Delete statistic
- `PUT /api/content/admin/contact` - Update contact info

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcryptjs
- CORS protection
- Rate limiting
- Helmet security headers
- Input validation
- SQL injection protection

## 🎨 Customization

### Colors (CSS Variables)
```css
:root {
  --primary-gold: #C5A572;
  --primary-dark: #1a1a1a;
  --secondary-gray: #f8f9fa;
  --text-dark: #2c3e50;
  --text-light: #6c757d;
}
```

### Logo
Replace `frontend/public/logo.png` with your company logo.

### Content
All content can be modified through the admin panel without code changes.

## 🚀 Deployment

### Production Build
```bash
# Build frontend for production
cd frontend
npm run build

# Start backend in production mode
cd ../backend
NODE_ENV=production npm start
```

### Environment Variables for Production
```env
NODE_ENV=production
DB_HOST=your_production_db_host
DB_USER=your_production_db_user
DB_PASSWORD=your_production_db_password
DB_NAME=arna_energy
JWT_SECRET=your_very_secure_secret_key_change_this
PORT=3001
```

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure MySQL is running
   - Check database credentials in .env file
   - Verify database exists

2. **Port Already in Use**
   - Change PORT in backend/.env file
   - Kill processes using ports 3000/3001

3. **Admin Login Issues**
   - Check default credentials (admin/admin123)
   - Verify JWT_SECRET in .env file

4. **Frontend Not Loading**
   - Ensure backend is running on port 3001
   - Check proxy setting in frontend/package.json

### Database Reset
To reset the database and start fresh:
```sql
DROP DATABASE arna_energy;
CREATE DATABASE arna_energy;
```
Restart the backend server to recreate tables with default data.

## 📄 License

This project is licensed under the MIT License.

## 🤝 Support

For support and questions:
- Check the troubleshooting section
- Review the API documentation
- Ensure all dependencies are properly installed

---

**ARNA Energy Website** - Built with ❤️ for sustainable energy companies
