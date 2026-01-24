# HRMS Lite - Backend API

RESTful API backend for the HRMS Lite application built with Node.js, Express, Prisma, and PostgreSQL (via Neon DB).

## 🚀 Overview

This backend provides a complete API for managing employees and attendance records. It features:
- RESTful API design
- Server-side validation
- Error handling with proper HTTP status codes
- Database persistence with Prisma ORM
- PostgreSQL database hosted on Neon DB

## 🛠️ Tech Stack

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Prisma** - Modern ORM for database management
- **PostgreSQL** - Relational database (hosted on Neon DB)
- **express-validator** - Request validation middleware
- **dotenv** - Environment variable management
- **cors** - Cross-Origin Resource Sharing

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Neon DB account (free tier available) - [Sign up here](https://console.neon.tech)

## 🔧 Installation & Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the backend root directory:

```bash
touch .env
```

Add the following environment variables:

```env
DATABASE_URL="postgresql://username:password@ep-xxxxx-pooler.region.aws.neon.tech/dbname?sslmode=require"
PORT=5000
```

**Getting your Neon DB connection string:**
1. Go to [Neon Console](https://console.neon.tech)
2. Create a new project or select an existing one
3. Click "Connect" on your Project Dashboard
4. Copy the connection string (make sure to remove `&channel_binding=require` if present)
5. Paste it into your `.env` file

For detailed Neon DB setup, see [NEON_SETUP.md](./NEON_SETUP.md)

### 3. Set Up Database

```bash
# Generate Prisma Client
npm run generate

# Push schema to database (creates tables)
npx prisma db push
```

### 4. Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:5000` (or the port specified in your `.env` file).

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

## 🗄️ Database Schema

### Employee Model
```prisma
model Employee {
  id          String       @id @default(uuid())
  employeeId  String       @unique
  fullName    String
  email       String       @unique
  department  String
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  attendances Attendance[]
}
```

### Attendance Model
```prisma
model Attendance {
  id         String   @id @default(uuid())
  employeeId String
  employee   Employee @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  date       DateTime
  status     String   // "Present" or "Absent"
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@unique([employeeId, date])
  @@index([employeeId])
  @@index([date])
}
```

## 🔌 API Endpoints

### Base URL
```
http://localhost:5000/api
```

### Health Check

#### GET /api/health
Check if the API is running.

**Response:**
```json
{
  "status": "ok",
  "message": "HRMS Lite API is running"
}
```

---

### Employee Management

#### GET /api/employees
Get all employees.

**Response:**
```json
[
  {
    "id": "uuid",
    "employeeId": "EMP001",
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "department": "Engineering",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "_count": {
      "attendances": 5
    }
  }
]
```

#### GET /api/employees/:id
Get a specific employee by ID.

**Parameters:**
- `id` (path) - Employee UUID

**Response:**
```json
{
  "id": "uuid",
  "employeeId": "EMP001",
  "fullName": "John Doe",
  "email": "john.doe@example.com",
  "department": "Engineering",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "attendances": [...]
}
```

**Error Responses:**
- `404` - Employee not found

#### POST /api/employees
Create a new employee.

**Request Body:**
```json
{
  "employeeId": "EMP001",
  "fullName": "John Doe",
  "email": "john.doe@example.com",
  "department": "Engineering"
}
```

**Validation:**
- `employeeId` - Required, must be unique
- `fullName` - Required
- `email` - Required, must be valid email format, must be unique
- `department` - Required

**Response:**
```json
{
  "id": "uuid",
  "employeeId": "EMP001",
  "fullName": "John Doe",
  "email": "john.doe@example.com",
  "department": "Engineering",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `400` - Validation errors
- `409` - Duplicate employee ID or email

#### DELETE /api/employees/:id
Delete an employee.

**Parameters:**
- `id` (path) - Employee UUID

**Response:**
- `204` - No content (success)

**Error Responses:**
- `404` - Employee not found

---

### Attendance Management

#### GET /api/attendance
Get all attendance records with optional filters.

**Query Parameters:**
- `employeeId` (optional) - Filter by employee UUID
- `startDate` (optional) - Filter from date (ISO 8601 format)
- `endDate` (optional) - Filter to date (ISO 8601 format)

**Example:**
```
GET /api/attendance?employeeId=uuid&startDate=2024-01-01&endDate=2024-01-31
```

**Response:**
```json
[
  {
    "id": "uuid",
    "employeeId": "uuid",
    "date": "2024-01-01T00:00:00.000Z",
    "status": "Present",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "employee": {
      "id": "uuid",
      "employeeId": "EMP001",
      "fullName": "John Doe",
      "email": "john.doe@example.com",
      "department": "Engineering"
    }
  }
]
```

#### GET /api/attendance/employee/:employeeId
Get attendance records for a specific employee with summary.

**Parameters:**
- `employeeId` (path) - Employee UUID

**Query Parameters:**
- `startDate` (optional) - Filter from date
- `endDate` (optional) - Filter to date

**Response:**
```json
{
  "attendances": [...],
  "summary": {
    "totalRecords": 20,
    "totalPresent": 18,
    "totalAbsent": 2
  }
}
```

#### POST /api/attendance
Mark attendance for an employee.

**Request Body:**
```json
{
  "employeeId": "uuid",
  "date": "2024-01-01T00:00:00.000Z",
  "status": "Present"
}
```

**Validation:**
- `employeeId` - Required, must exist
- `date` - Required, must be valid ISO 8601 date
- `status` - Required, must be "Present" or "Absent"

**Response:**
```json
{
  "id": "uuid",
  "employeeId": "uuid",
  "date": "2024-01-01T00:00:00.000Z",
  "status": "Present",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "employee": {...}
}
```

**Note:** If attendance already exists for the same employee and date, it will be updated.

**Error Responses:**
- `400` - Validation errors
- `404` - Employee not found
- `409` - Attendance already marked (rare, usually updates instead)

#### GET /api/attendance/dashboard/summary
Get dashboard summary statistics.

**Response:**
```json
{
  "totalEmployees": 10,
  "totalAttendanceRecords": 200,
  "presentCount": 180,
  "absentCount": 20,
  "employeesSummary": [
    {
      "id": "uuid",
      "employeeId": "EMP001",
      "fullName": "John Doe",
      "department": "Engineering",
      "totalAttendanceDays": 20,
      "presentDays": 18
    }
  ]
}
```

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

## 🔒 Validation & Error Handling

### Validation Rules

**Employee Creation:**
- Employee ID must be unique
- Email must be valid format and unique
- All fields are required

**Attendance Marking:**
- Employee must exist
- Date must be valid ISO 8601 format
- Status must be "Present" or "Absent"
- One attendance record per employee per day (updates existing)

### Error Responses

All errors follow a consistent format:

```json
{
  "error": "Error message here"
}
```

For validation errors:
```json
{
  "errors": [
    {
      "msg": "Email is required",
      "param": "email",
      "location": "body"
    }
  ]
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `204` - No Content (successful delete)
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `409` - Conflict (duplicate entries)
- `500` - Internal Server Error

## 🚀 Deployment

### Environment Variables for Production

Make sure to set these in your hosting platform:

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

### Database Migration in Production

For production, use migrations instead of `db push`:

```bash
# Create migration
npm run migrate

# Apply migrations (in production)
npx prisma migrate deploy
```

## 🐛 Troubleshooting

### Connection Issues

**Error: `P1001 - Can't reach database server`**

1. Verify your `DATABASE_URL` is correct
2. Check that your Neon project is active (not paused)
3. Ensure connection string uses `?sslmode=require` (not `&channel_binding=require`)
4. Try using direct connection (without `-pooler`)

**Error: `Environment variable not found: DATABASE_URL`**

1. Make sure `.env` file exists in the backend root
2. Verify the file contains `DATABASE_URL=...`
3. Restart the server after changing `.env`

### Database Schema Issues

**Error: `Table does not exist`**

Run:
```bash
npx prisma db push
```

**Error: `Prisma Client not generated`**

Run:
```bash
npm run generate
```

## 📝 Notes

- The server uses ES modules (`type: "module"` in package.json)
- Environment variables are loaded from `.env.local` first, then `.env`
- CORS is enabled for all origins (configure for production)
- The server uses `express-validator` for request validation
- Prisma Client is generated automatically on `npm install`

## 🔗 Related Documentation

- [Main Project README](../README.md)
- [Neon DB Setup Guide](./NEON_SETUP.md)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Express.js Documentation](https://expressjs.com/)

---

**Happy Coding! 🚀**
