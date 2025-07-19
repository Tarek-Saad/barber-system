import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === "GET") {
      // Get all employees with today's attendance and financial data
      const today = new Date().toISOString().split("T")[0];

      const employees = await prisma.employee.findMany({
        where: {
          is_active: true,
        },
        include: {
          attendance: {
            where: {
              attendance_date: new Date(today),
            },
            take: 1,
          },
          financial_transactions: {
            where: {
              transaction_date: new Date(today),
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      });

      // Transform data to match UI expectations
      const transformedEmployees = employees.map((employee) => {
        const todayAttendance = employee.attendance[0];
        const todayTransactions = employee.financial_transactions;

        const today_withdrawals = todayTransactions
          .filter((t) => t.transaction_type === "withdrawal")
          .reduce((sum, t) => sum + Number(t.amount), 0);

        const today_bonuses = todayTransactions
          .filter((t) => t.transaction_type === "bonus")
          .reduce((sum, t) => sum + Number(t.amount), 0);

        const today_deductions = todayTransactions
          .filter((t) => t.transaction_type === "deduction")
          .reduce((sum, t) => sum + Number(t.amount), 0);

        const today_payments = todayTransactions
          .filter((t) => t.transaction_type === "salary_payment")
          .reduce((sum, t) => sum + Number(t.amount), 0);

        return {
          id: employee.id,
          name: employee.name,
          position: employee.position,
          phone: employee.phone,
          daily_wage: Number(employee.daily_wage),
          current_balance: Number(employee.current_balance),
          total_bonuses: Number(employee.total_bonuses),
          total_deductions: Number(employee.total_deductions),
          payment_status: employee.payment_status as
            | "pending"
            | "paid"
            | "deferred",
          is_active: employee.is_active,
          hire_date: employee.hire_date.toISOString(),
          last_payment_date: employee.last_payment_date?.toISOString(),
          created_at: employee.created_at.toISOString(),
          updated_at: employee.updated_at.toISOString(),
          today_attendance:
            (todayAttendance?.status as "present" | "absent") || "absent",
          today_withdrawals,
          today_bonuses,
          today_deductions,
          today_payments,
        };
      });

      res.status(200).json(transformedEmployees);
    } else if (req.method === "POST") {
      // Create new employee
      const { name, position, phone, daily_wage } = req.body;

      if (!name || !position || !daily_wage) {
        return res
          .status(400)
          .json({ error: "Name, position, and daily_wage are required" });
      }

      const employee = await prisma.employee.create({
        data: {
          name,
          position,
          phone,
          daily_wage: Number(daily_wage),
          current_balance: Number(daily_wage), // Start with one day's wage
        },
      });

      res.status(201).json({
        id: employee.id,
        name: employee.name,
        position: employee.position,
        phone: employee.phone,
        daily_wage: Number(employee.daily_wage),
        current_balance: Number(employee.current_balance),
        total_bonuses: Number(employee.total_bonuses),
        total_deductions: Number(employee.total_deductions),
        payment_status: employee.payment_status,
        is_active: employee.is_active,
        hire_date: employee.hire_date.toISOString(),
        last_payment_date: employee.last_payment_date?.toISOString(),
        created_at: employee.created_at.toISOString(),
        updated_at: employee.updated_at.toISOString(),
      });
    } else {
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
