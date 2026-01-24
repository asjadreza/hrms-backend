import express from 'express';
import { body, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Validation middleware
const validateEmployee = [
  body('employeeId').trim().notEmpty().withMessage('Employee ID is required'),
  body('fullName').trim().notEmpty().withMessage('Full Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('department').trim().notEmpty().withMessage('Department is required'),
];

// Get all employees
router.get('/', async (req, res, next) => {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { attendances: true },
        },
      },
    });
    res.json(employees);
  } catch (error) {
    next(error);
  }
});

// Get single employee
router.get('/:id', async (req, res, next) => {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: req.params.id },
      include: {
        attendances: {
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json(employee);
  } catch (error) {
    next(error);
  }
});

// Create employee
router.post('/', validateEmployee, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { employeeId, fullName, email, department } = req.body;

    // Check for duplicate employee ID
    const existingById = await prisma.employee.findUnique({
      where: { employeeId },
    });

    if (existingById) {
      return res.status(409).json({ error: 'Employee ID already exists' });
    }

    // Check for duplicate email
    const existingByEmail = await prisma.employee.findUnique({
      where: { email },
    });

    if (existingByEmail) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    const employee = await prisma.employee.create({
      data: {
        employeeId,
        fullName,
        email,
        department,
      },
    });

    res.status(201).json(employee);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Duplicate entry detected' });
    }
    next(error);
  }
});

// Delete employee
router.delete('/:id', async (req, res, next) => {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: req.params.id },
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    await prisma.employee.delete({
      where: { id: req.params.id },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
