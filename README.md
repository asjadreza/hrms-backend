# HRMS Lite - Backend API

RESTful API backend for the HRMS Lite application built with Node.js, Express, Prisma, and PostgreSQL (via Neon DB).

## 📋 Project Overview

The HRMS Lite Backend is a RESTful API server that provides the core functionality for managing employees and attendance records. It serves as the data layer and business logic handler for the HRMS Lite frontend application.

### Key Features

- **Employee Management API**: Create, read, and delete employee records with validation
- **Attendance Tracking API**: Mark and retrieve attendance records with date-based filtering
- **Dashboard Analytics**: Provide summary statistics for the frontend dashboard
- **RESTful Design**: Standard HTTP methods and status codes for all operations
- **Server-Side Validation**: Input validation using express-validator
- **Error Handling**: Comprehensive error handling with appropriate HTTP status codes
- **Database Integration**: PostgreSQL database managed through Prisma ORM
- **Cloud Database**: Uses Neon DB (free tier) for PostgreSQL hosting

### API Capabilities

- Employee CRUD operations with unique constraints (Employee ID, Email)
- Attendance marking with automatic updates for duplicate dates
- Flexible filtering (by employee, date range)
- Dashboard summary with aggregated statistics
- Health check endpoint for monitoring

## 🛠️ Tech Stack

- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework for building REST APIs
- **Prisma** - Modern ORM (Object-Relational Mapping) for database management
- **PostgreSQL** - Relational database (hosted on Neon DB - free tier)
- **express-validator** - Request validation middleware
- **dotenv** - Environment variable management
- **cors** - Cross-Origin Resource Sharing middleware

## 🚀 Steps to Run the Project Locally

### Prerequisites

Before starting, ensure you have:
- **Node.js** (v18 or higher) installed
- **npm** or **yarn** package manager
- A **Neon DB account** (free tier available) - [Sign up here](https://console.neon.tech)

### Step 1: Clone and Navigate to Backend

```bash
# If cloning the entire repository
git clone <repository-url>
cd quess-corps-hrms/backend

# Or if already in the project root
cd backend
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Set Up Neon DB (Free PostgreSQL Database)

1. **Create a Neon Account**
   - Go to [https://console.neon.tech](https://console.neon.tech)
   - Sign up for a free account (no credit card required)

2. **Create a New Project**
   - Click "Create a project"
   - Choose a project name (e.g., "HRMS Lite")
   - Select a region closest to you
   - Click "Create project"

3. **Get Your Connection String**
   - On your Project Dashboard, click the **"Connect"** button
   - In the connection modal:
     - Select your branch (usually `main`)
     - Select your database (default is usually `neondb`)
     - Select your role
     - **Keep "Connection pooling" enabled** (recommended)
   - Copy the connection string
   
   **Important**: Remove `&channel_binding=require` from the connection string if present. Use only `?sslmode=require`.
   
   Example format: `postgresql://user:password@ep-xxxxx-pooler.region.aws.neon.tech/dbname?sslmode=require`

For detailed Neon DB setup, see [NEON_SETUP.md](./NEON_SETUP.md)

### Step 4: Configure Environment Variables

Create a `.env` file in the backend root directory:

```bash
touch .env
```

Edit the `.env` file and add:

```env
DATABASE_URL="postgresql://your-username:your-password@ep-xxxxx-pooler.region.aws.neon.tech/neondb?sslmode=require"
PORT=5000
```

**Note**: Replace the connection string with your actual Neon DB connection string.

### Step 5: Set Up Database Schema

```bash
# Generate Prisma Client
npm run generate

# Push schema to database (creates tables)
npx prisma db push
```

This will create the `Employee` and `Attendance` tables in your Neon database.

### Step 6: Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:5000` (or the port specified in your `.env` file).

### Step 7: Verify the API

Test the health check endpoint:
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "HRMS Lite API is running"
}
```

### Quick Start Commands Summary

```bash
# Install dependencies
npm install

# Set up .env file with DATABASE_URL and PORT
# Then run:
npm run generate
npx prisma db push
npm run dev
```

## 📝 Assumptions & Limitations

### Assumptions

1. **No Authentication Required**: The API assumes no authentication system. All endpoints are publicly accessible (suitable for development/internal use only)

2. **Single Organization**: The system is designed for a single organization with no multi-tenant architecture

3. **Manual Employee ID Assignment**: Employee IDs are manually assigned by users and must be unique. The system does not auto-generate employee IDs

4. **Flexible Date Attendance**: Attendance can be marked for any date (past, present, or future) to allow for corrections and advance planning

5. **One Record Per Day**: Only one attendance record exists per employee per day. Marking attendance again for the same date updates the existing record (upsert behavior)

6. **Binary Status Model**: Attendance status is limited to "Present" or "Absent" only. No additional states like "Half Day", "Leave", or "Holiday"

7. **Cascade Deletion**: Deleting an employee automatically deletes all associated attendance records (cascade delete)

8. **Date Normalization**: Date filters normalize to start of day (00:00:00) for startDate and end of day (23:59:59) for endDate to handle timezone differences

9. **CORS Enabled for All Origins**: CORS is configured to allow requests from any origin (should be restricted in production)

10. **ES Modules**: The project uses ES modules (`type: "module"`) instead of CommonJS

### Limitations

1. **No Authentication/Authorization**: There is no user authentication, authorization, or role-based access control. All API endpoints are publicly accessible

2. **No Rate Limiting**: The API does not implement rate limiting, making it vulnerable to abuse or DDoS attacks

3. **No Input Sanitization**: While validation exists, there is no advanced input sanitization to prevent injection attacks

4. **No Audit Logging**: No logging system to track who made changes, when, or what changes were made

5. **No Soft Deletes**: Employee deletion is permanent. Once deleted, employee and attendance records cannot be recovered

6. **No Bulk Operations**: No endpoints for bulk creating, updating, or deleting multiple records at once

7. **No Pagination**: List endpoints (GET /api/employees, GET /api/attendance) return all records without pagination, which may cause performance issues with large datasets

8. **No Sorting**: Results are returned in default database order with no sorting options

9. **No Advanced Filtering**: Limited filtering options. No search functionality, partial matching, or complex queries

10. **No Data Validation for Status**: While status must be "Present" or "Absent", there's no enum constraint at the database level

11. **No Transaction Management**: Complex operations don't use database transactions, which could lead to data inconsistency in edge cases

12. **No Caching**: All database queries are executed directly without caching, which may impact performance

13. **No API Versioning**: No versioning system for API endpoints, making future breaking changes difficult

14. **Limited Error Details**: Error messages may not always provide detailed debugging information in production

15. **No Webhooks/Events**: No event system or webhooks for notifying external systems of changes

### Future Enhancements

For production use, consider adding:
- JWT-based authentication and authorization
- Role-based access control (Admin, HR, Employee)
- Rate limiting and API throttling
- Input sanitization and security hardening
- Comprehensive audit logging
- Soft delete functionality
- Pagination and sorting for list endpoints
- Advanced filtering and search capabilities
- Database-level constraints and enums
- Transaction management for complex operations
- Caching layer (Redis)
- API versioning (e.g., /api/v1/)
- Webhook/event system
- Comprehensive testing (unit, integration, e2e)
- API documentation (Swagger/OpenAPI)
- Monitoring and logging (Winston, Sentry)
- Health checks and metrics endpoints

## 📁 Project Structure

```
backend/
├── prisma/
│   └── schema.prisma          # Database schema definitions
├── src/
│   ├── routes/
│   │   ├── employees.js       # Employee management routes
│   │   └── attendance.js      # Attendance management routes
│   └── server.js              # Express server configuration
├── .env                       # Environment variables (create this)
├── .env.local                 # Local environment overrides (optional)
├── package.json
└── README.md
```

## 🔌 API Endpoints

### Base URL
```
http://localhost:5000/api
```

### Employee Management
- `GET /api/employees` - Get all employees
- `GET /api/employees/:id` - Get employee by ID
- `POST /api/employees` - Create new employee
- `DELETE /api/employees/:id` - Delete employee

### Attendance Management
- `GET /api/attendance` - Get all attendance records (with optional filters: `employeeId`, `startDate`, `endDate`)
- `GET /api/attendance/employee/:employeeId` - Get attendance for specific employee
- `POST /api/attendance` - Mark attendance
- `GET /api/attendance/dashboard/summary` - Get dashboard summary

### Health Check
- `GET /api/health` - API health check

For detailed API documentation with request/response examples, see the [Main Project README](../README.md) or test the endpoints using tools like Postman or curl.

## 🛠️ Development Commands

```bash
# Start development server (with auto-reload)
npm run dev

# Start production server
npm start

# Generate Prisma Client (after schema changes)
npm run generate

# Push schema changes to database
npx prisma db push

# Run migrations (for production)
npm run migrate

# Open Prisma Studio (database GUI)
npm run studio
```

## 🚀 Deployment

### Environment Variables for Production

Set these in your hosting platform:
```env
DATABASE_URL="your-neon-db-connection-string"
PORT=5000  # or let the platform assign it
```

### Build & Start Commands

**Build:**
```bash
npm install && npm run generate
```

**Start:**
```bash
npm start
```

### Recommended Platforms

- **Render** - Easy deployment with automatic SSL
- **Railway** - Simple setup with database integration
- **Heroku** - Traditional PaaS option
- **Fly.io** - Global edge deployment

## 🔗 Related Documentation

- [Main Project README](../README.md)
- [Frontend README](../frontend/README.md)
- [Neon DB Setup Guide](./NEON_SETUP.md)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Express.js Documentation](https://expressjs.com/)

---

**Happy Coding! 🚀**
