# SnackSmart - Complete Setup Instructions

## 🎯 Project Overview
SnackSmart is a complete Multi Restaurant Management System with:
- **Restaurant Owners**: Register restaurants, manage menus
- **Customers**: Browse restaurants, view menus, leave reviews
- **Admin**: Manage all restaurants and users

## 📋 Prerequisites
- Java 17+
- Node.js 16+
- MySQL 8.0+
- Maven 3.6+

## 🗄️ Database Setup

### 1. Create Database
```sql
mysql -u root -p
CREATE DATABASE snacksmart_db;
```

### 2. Run Schema
```bash
mysql -u root -p snacksmart_db < enhanced-database-schema.sql
```

### 3. Update Credentials
Edit `snacksmart-backend/src/main/resources/application.properties`:
```properties
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD
```

## 🚀 Backend Setup

### 1. Navigate to Backend
```bash
cd snacksmart-backend
```

### 2. Install & Run
```bash
mvn clean install
mvn spring-boot:run
```

Backend runs on: `http://localhost:8080`

## 🎨 Frontend Setup

### 1. Navigate to Frontend
```bash
cd snacksmart-frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm start
```

Frontend runs on: `http://localhost:3000`

## 🔑 Default Login Credentials

### Admin
- Username: `admin`
- Password: `password`

### Restaurant Owner
- Username: `john_owner`
- Password: `password`

### Customer
- Username: `jane_customer`
- Password: `password`

## 🌟 Key Features

### For Restaurant Owners:
✅ Register restaurant with full details (name, location, phone, description, image)
✅ Add/edit/delete dishes with categories (Veg/Non-Veg)
✅ Upload dish images from local system
✅ Update restaurant information
✅ View restaurant ratings

### For Customers:
✅ Browse all restaurants with ratings and images
✅ Search restaurants by name/location
✅ View detailed restaurant pages with full menus
✅ Filter dishes by Veg/Non-Veg categories
✅ Search dishes within restaurants
✅ Leave reviews and ratings
✅ View all customer reviews

### For Admins:
✅ View all restaurants and users
✅ Manage system-wide data
✅ Delete users and restaurants

## 🛠️ API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Restaurants
- `GET /api/restaurants` - List all restaurants
- `GET /api/restaurants/{id}` - Get single restaurant
- `POST /api/restaurants/register` - Register new restaurant
- `PUT /api/restaurants/{id}` - Update restaurant
- `DELETE /api/restaurants/{id}` - Delete restaurant

### Dishes
- `GET /api/dishes/restaurant/{id}` - Get restaurant dishes
- `GET /api/dishes/search?name=X&category=Y` - Search dishes
- `POST /api/dishes/add` - Add new dish
- `PUT /api/dishes/{id}` - Update dish
- `DELETE /api/dishes/{id}` - Delete dish

### Reviews
- `GET /api/reviews/restaurant/{id}` - Get restaurant reviews
- `POST /api/reviews/add` - Add review

### File Upload
- `POST /api/upload/image` - Upload dish images
- `GET /api/upload/images/{filename}` - Serve images

## 🎨 Frontend Components

### Main Components:
- `CustomerDashboard.js` - Restaurant browsing homepage
- `RestaurantDetail.js` - Individual restaurant page with menu & reviews
- `OwnerDashboard.js` - Restaurant management for owners
- `AdminDashboard.js` - System administration
- `Login.js` - Authentication

### Key Features:
- Responsive design with Tailwind CSS
- Star ratings display
- Veg/Non-Veg indicators
- Image upload functionality
- Search and filtering
- Review system

## 🔧 Troubleshooting

### Port Issues
- Backend: Change port in `application.properties`
- Frontend: Use `PORT=3001 npm start`

### Database Connection
- Verify MySQL is running
- Check credentials in `application.properties`
- Ensure database exists

### CORS Issues
- Backend configured for `localhost:3000`
- Update CORS origins if using different ports

## 📁 Project Structure

```
Restaurant1/
├── snacksmart-backend/          # Spring Boot API
│   ├── src/main/java/com/snacksmart/
│   │   ├── entity/              # JPA Entities
│   │   ├── repository/          # Data Repositories
│   │   ├── service/             # Business Logic
│   │   ├── controller/          # REST Controllers
│   │   ├── config/              # Configuration
│   │   └── dto/                 # Data Transfer Objects
│   └── src/main/resources/
│       └── application.properties
├── snacksmart-frontend/         # React Application
│   ├── src/
│   │   ├── components/          # React Components
│   │   ├── services/            # API Services
│   │   ├── App.js              # Main App
│   │   └── index.js            # Entry Point
│   └── public/
└── enhanced-database-schema.sql # Database Setup
```

## 🎉 Success!

Your SnackSmart Multi Restaurant Management System is now ready!

- **Customers** can browse restaurants and leave reviews
- **Owners** can manage their restaurants and menus
- **Admins** can oversee the entire system

Visit `http://localhost:3000` to start using the application!