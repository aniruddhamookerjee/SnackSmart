# SnackSmart - Multi Restaurant Management System

A complete full-stack web application for managing multiple restaurants with role-based access control.

## Features

- **Multi-user system** with three roles: Customer, Restaurant Owner, and Admin
- **Customer Dashboard**: View and search dishes from all restaurants
- **Owner Dashboard**: Manage dishes (add, edit, delete)
- **Admin Dashboard**: Manage users and restaurants
- **JWT Authentication** with secure login/signup
- **Responsive UI** built with React and Tailwind CSS
- **RESTful API** with Spring Boot
- **MySQL Database** with JPA/Hibernate

## Tech Stack

### Backend
- Java 17
- Spring Boot 3.2.0
- Spring Security
- Spring Data JPA
- MySQL 8.0
- JWT Authentication
- Maven

### Frontend
- React 18
- Tailwind CSS
- Axios
- React Router DOM

## Prerequisites

- Java 17 or higher
- Node.js 16 or higher
- MySQL 8.0
- Maven 3.6+

## Setup Instructions

### 1. Database Setup

1. Install MySQL and create a database:
```sql
CREATE DATABASE snacksmart_db;
```

2. Run the SQL schema file:
```bash
mysql -u root -p snacksmart_db < database-schema.sql
```

3. Update database credentials in `snacksmart-backend/src/main/resources/application.properties`:
```properties
spring.datasource.username=your_username
spring.datasource.password=your_password
```

### 2. Backend Setup

1. Navigate to backend directory:
```bash
cd snacksmart-backend
```

2. Install dependencies and run:
```bash
mvn clean install
mvn spring-boot:run
```

The backend will start on `http://localhost:9090`

### 3. Frontend Setup

1. Navigate to frontend directory:
```bash
cd snacksmart-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will start on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration

### Customer Endpoints
- `GET /api/dishes` - Get all dishes
- `GET /api/dishes/search?name={query}` - Search dishes by name
- `GET /api/restaurants` - Get all restaurants

### Owner Endpoints
- `POST /api/dishes/add` - Add new dish
- `PUT /api/dishes/{id}` - Update dish
- `DELETE /api/dishes/{id}` - Delete dish
- `GET /api/dishes/restaurant/{restaurant_id}` - Get dishes by restaurant

### Admin Endpoints
- `GET /api/admin/users` - Get all users
- `GET /api/admin/restaurants` - Get all restaurants
- `DELETE /api/admin/user/{id}` - Delete user

## Default Login Credentials

### Admin
- Username: `admin`
- Password: `password`

### Restaurant Owner
- Username: `john_owner`
- Password: `password`

### Customer
- Username: `jane_customer`
- Password: `password`

## Project Structure

```
snacksmart-backend/
├── src/main/java/com/snacksmart/
│   ├── entity/          # JPA entities
│   ├── repository/      # Data repositories
│   ├── service/         # Business logic
│   ├── controller/      # REST controllers
│   ├── dto/            # Data transfer objects
│   └── config/         # Configuration classes
└── src/main/resources/
    └── application.properties

snacksmart-frontend/
├── src/
│   ├── components/     # React components
│   ├── services/       # API services
│   ├── App.js         # Main app component
│   └── index.js       # Entry point
└── public/
    └── index.html
```

## Usage

1. **Customer**: Register/login to view and search dishes from all restaurants
2. **Restaurant Owner**: Register/login to manage your restaurant's dishes
3. **Admin**: Login to manage users and restaurants system-wide

## Security Features

- Password hashing with BCrypt
- JWT token-based authentication
- CORS configuration for cross-origin requests
- Input validation and sanitization
- Role-based access control

## Development Notes

- Backend runs on port 9090
- Frontend runs on port 3000
- CORS is configured to allow frontend requests
- Database tables are auto-created by Hibernate
- Sample data is included for testing

## Troubleshooting

1. **Database Connection Issues**: Verify MySQL is running and credentials are correct
2. **CORS Errors**: Ensure backend CORS configuration allows frontend origin
3. **JWT Errors**: Check if JWT secret is properly configured
4. **Port Conflicts**: Change ports in application.properties (backend) or package.json (frontend)

## Future Enhancements

- Order management system
- Payment integration
- Restaurant ratings and reviews
- Real-time notifications
- Image upload functionality
- Advanced search filters
- Mobile app support