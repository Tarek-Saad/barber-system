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
      const { transaction_type, amount, description } = req.body;

      if (!transaction_type || !amount || amount <= 0) {
        return res
          .status(400)
          .json({ error: "Transaction type and positive amount are required" });
      }

      // Check if employee exists
      const employee = await prisma.employee.findUnique({
        where: { id: employeeId, is_active: true },
      });

      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }

      // Check balance for withdrawals
      if (["withdrawal", "salary_payment"].includes(transaction_type)) {
        if (Number(employee.current_balance) < Number(amount)) {
          return res.status(400).json({
            error: `Insufficient balance. Current: ${employee.current_balance}, Requested: ${amount}`,
          });
        }
      }

      // Start transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create financial transaction
        const transaction = await tx.financialTransaction.create({
          data: {
            employee_id: employeeId,
            transaction_type,
            amount: Number(amount),
            description,
            transaction_date: new Date(),
            created_by: "system",
          },
        });

        // Calculate balance changes
        let balance_change = 0;
        let bonus_change = 0;
        let deduction_change = 0;

        switch (transaction_type) {
          case "withdrawal":
          case "salary_payment":
            balance_change = -Number(amount);
            break;
          case "deduction":
            balance_change = -Number(amount);
            deduction_change = Number(amount);
            break;
          case "bonus":
            balance_change = Number(amount);
            bonus_change = Number(amount);
            break;
        }

        // Update employee balance
        const updatedEmployee = await tx.employee.update({
          where: { id: employeeId },
          data: {
            current_balance: {
              increment: balance_change,
            },
            total_bonuses: {
              increment: bonus_change,
            },
            total_deductions: {
              increment: deduction_change,
            },
            ...(transaction_type === "salary_payment" && {
              last_payment_date: new Date(),
              payment_status: "paid",
            }),
          },
        });

        return { transaction, updatedEmployee };
      });

      res.status(201).json({
        transaction: {
          id: result.transaction.id,
          employee_id: result.transaction.employee_id,
          transaction_type: result.transaction.transaction_type,
          amount: Number(result.transaction.amount),
          description: result.transaction.description,
          transaction_date: result.transaction.transaction_date.toISOString(),
          created_by: result.transaction.created_by,
          created_at: result.transaction.created_at.toISOString(),
        },
        employee: {
          id: result.updatedEmployee.id,
          current_balance: Number(result.updatedEmployee.current_balance),
          total_bonuses: Number(result.updatedEmployee.total_bonuses),
          total_deductions: Number(result.updatedEmployee.total_deductions),
          payment_status: result.updatedEmployee.payment_status,
        },
      });
    } else {
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error("Transaction API Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
