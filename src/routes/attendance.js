import express from 'express';
import { body, validationResult, query } from 'express-validator';
import prisma from '../utils/prisma.js';
import { isDbUnavailableError, toDbUnavailableResponse } from '../utils/dbErrors.js';

const router = express.Router();

// Validation middleware
const validateAttendance = [
  body('employeeId').trim().notEmpty().withMessage('Employee ID is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('status').isIn(['Present', 'Absent']).withMessage('Status must be Present or Absent'),
];

// Get all attendance records (with optional filters)
router.get('/', [
  query('employeeId').optional().trim(),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { employeeId, startDate, endDate } = req.query;

    const where = {};
    if (employeeId) {
      where.employeeId = employeeId;
    }
    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        // Normalize start date to beginning of day (00:00:00.000)
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        where.date.gte = start;
      }
      if (endDate) {
        // Normalize end date to end of day (23:59:59.999)
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.date.lte = end;
      }
    }

    const attendances = await prisma.attendance.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            fullName: true,
            email: true,
            department: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    res.json(attendances);
  } catch (error) {
    if (isDbUnavailableError(error)) {
      const { status, body } = toDbUnavailableResponse();
      return res.status(status).json(body);
    }
    next(error);
  }
});

// Get attendance for a specific employee
router.get('/employee/:employeeId', async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const { startDate, endDate } = req.query;

    const where = { employeeId };
    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        // Normalize start date to beginning of day (00:00:00.000)
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        where.date.gte = start;
      }
      if (endDate) {
        // Normalize end date to end of day (23:59:59.999)
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.date.lte = end;
      }
    }

    const attendances = await prisma.attendance.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            fullName: true,
            email: true,
            department: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    // Calculate total present days
    const totalPresent = attendances.filter(a => a.status === 'Present').length;
    const totalAbsent = attendances.filter(a => a.status === 'Absent').length;

    res.json({
      attendances,
      summary: {
        totalRecords: attendances.length,
        totalPresent,
        totalAbsent,
      },
    });
  } catch (error) {
    if (isDbUnavailableError(error)) {
      const { status, body } = toDbUnavailableResponse();
      return res.status(status).json(body);
    }
    next(error);
  }
});

// Mark attendance
router.post('/', validateAttendance, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { employeeId, date, status } = req.body;

    // Check if employee exists
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Normalize date to start of day for comparison
    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    // Check if attendance already exists for this date
    const existing = await prisma.attendance.findFirst({
      where: {
        employeeId,
        date: {
          gte: new Date(attendanceDate),
          lt: new Date(attendanceDate.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    if (existing) {
      // Update existing attendance
      const updated = await prisma.attendance.update({
        where: { id: existing.id },
        data: { status },
        include: {
          employee: {
            select: {
              id: true,
              employeeId: true,
              fullName: true,
              email: true,
              department: true,
            },
          },
        },
      });
      return res.json(updated);
    }

    // Create new attendance
    const attendance = await prisma.attendance.create({
      data: {
        employeeId,
        date: attendanceDate,
        status,
      },
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            fullName: true,
            email: true,
            department: true,
          },
        },
      },
    });

    res.status(201).json(attendance);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Attendance already marked for this date' });
    }
    if (isDbUnavailableError(error)) {
      const { status, body } = toDbUnavailableResponse();
      return res.status(status).json(body);
    }
    next(error);
  }
});

// Get dashboard summary
router.get('/dashboard/summary', async (req, res, next) => {
  try {
    const totalEmployees = await prisma.employee.count();
    const totalAttendanceRecords = await prisma.attendance.count();
    const presentCount = await prisma.attendance.count({
      where: { status: 'Present' },
    });
    const absentCount = await prisma.attendance.count({
      where: { status: 'Absent' },
    });

    // Get employees with their attendance counts
    const employeesWithAttendance = await prisma.employee.findMany({
      include: {
        _count: {
          select: { attendances: true },
        },
        attendances: {
          where: { status: 'Present' },
          select: { id: true },
        },
      },
    });

    const employeesSummary = employeesWithAttendance.map(emp => ({
      id: emp.id,
      employeeId: emp.employeeId,
      fullName: emp.fullName,
      department: emp.department,
      totalAttendanceDays: emp._count.attendances,
      presentDays: emp.attendances.length,
    }));

    res.json({
      totalEmployees,
      totalAttendanceRecords,
      presentCount,
      absentCount,
      employeesSummary,
    });
  } catch (error) {
    if (isDbUnavailableError(error)) {
      const { status, body } = toDbUnavailableResponse();
      return res.status(status).json(body);
    }
    next(error);
  }
});

export default router;
