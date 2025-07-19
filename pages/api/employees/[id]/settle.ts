import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  const employeeId = parseInt(id as string);

  if (isNaN(employeeId)) {
    return res.status(400).json({ error: "Invalid employee ID" });
  }

  try {
    if (req.method === "POST") {
      // Check if employee exists and get current balance
      const employee = await prisma.employee.findUnique({
        where: { id: employeeId, is_active: true },
      });

      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }

      const currentBalance = Number(employee.current_balance);

      if (currentBalance <= 0) {
        return res.status(400).json({ error: "No balance to settle" });
      }

      // Perform settlement transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create salary payment record
        const salaryPayment = await tx.salaryPayment.create({
          data: {
            employee_id: employeeId,
            payment_date: new Date(),
            daily_wage: employee.daily_wage,
            days_worked: 1,
            total_wage: employee.daily_wage,
            total_bonuses: employee.total_bonuses,
            total_deductions: employee.total_deductions,
            total_withdrawals: currentBalance,
            net_payment: currentBalance,
            payment_method: "cash",
            notes: "Account settlement - payment of outstanding balance",
          },
        });

        // Create financial transaction
        const transaction = await tx.financialTransaction.create({
          data: {
            employee_id: employeeId,
            transaction_type: "salary_payment",
            amount: currentBalance,
            description: "Account settlement - payment of outstanding balance",
            transaction_date: new Date(),
            created_by: "system",
          },
        });

        // Update employee
        const updatedEmployee = await tx.employee.update({
          where: { id: employeeId },
          data: {
            current_balance: 0,
            payment_status: "paid",
            last_payment_date: new Date(),
          },
        });

        return { salaryPayment, transaction, updatedEmployee };
      });

      res.status(200).json({
        message: "Account settled successfully",
        settlement_amount: currentBalance,
        salary_payment: {
          id: result.salaryPayment.id,
          payment_date: result.salaryPayment.payment_date.toISOString(),
          net_payment: Number(result.salaryPayment.net_payment),
        },
        employee: {
          id: result.updatedEmployee.id,
          current_balance: Number(result.updatedEmployee.current_balance),
          payment_status: result.updatedEmployee.payment_status,
          last_payment_date:
            result.updatedEmployee.last_payment_date?.toISOString(),
        },
      });
    } else {
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error("Settlement API Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
