import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import employeeRoutes from './routes/employees.js';
import attendanceRoutes from './routes/attendance.js';
import prisma from './utils/prisma.js';
import { isDbUnavailableError, toDbUnavailableResponse } from './utils/dbErrors.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local first, then .env (if exists)
dotenv.config({ path: join(__dirname, '../.env.local') });
dotenv.config({ path: join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'HRMS Lite API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  // If Neon is temporarily unreachable, avoid leaking Prisma internals to the frontend.
  if (isDbUnavailableError(err)) {
    const { status, body } = toDbUnavailableResponse();
    return res.status(status).json(body);
  }

  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

async function connectWithRetry({ retries = 5, delayMs = 1500 } = {}) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await prisma.$connect();
      return true;
    } catch (err) {
      const isLast = attempt === retries;
      console.warn(
        `Database connection attempt ${attempt}/${retries} failed${
          isLast ? '' : `, retrying in ${delayMs}ms`
        }.`
      );
      if (isLast) return false;
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  return false;
}

(async () => {
  // Warm up Prisma/Neon on startup to reduce first-request failures (Neon can be sleeping).
  await connectWithRetry();

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
})();
