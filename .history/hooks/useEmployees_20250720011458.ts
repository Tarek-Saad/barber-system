import { useState, useEffect, useCallback } from "react";
import {
  Employee,
  CreateEmployeeData,
  FinancialTransaction,
} from "../types/employee";
import {
  apiGetEmployees,
  apiCreateEmployee,
  apiAddTransaction,
  apiMarkAttendance,
  apiSettleAccount,
} from "../services/api";

export const useEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch employees
  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiGetEmployees();
      setEmployees(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch employees"
      );
      console.error("Error fetching employees:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Add employee
  const addEmployee = useCallback(async (employeeData: CreateEmployeeData) => {
    try {
      const newEmployee = await apiCreateEmployee(employeeData);
      setEmployees((prev) => [...prev, newEmployee]);
      return newEmployee;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to add employee";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Add transaction
  const addTransaction = useCallback(
    async (employeeId: number, transactionData: FinancialTransaction) => {
      try {
        const result = await apiAddTransaction(employeeId, transactionData);

        // Update the employee in local state
        setEmployees((prev) =>
          prev.map((emp) =>
            emp.id === employeeId
              ? {
                  ...emp,
                  current_balance: result.employee.current_balance,
                  total_bonuses: result.employee.total_bonuses,
                  total_deductions: result.employee.total_deductions,
                  payment_status: result.employee.payment_status,
                }
              : emp
          )
        );

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to add transaction";
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    []
  );

  // Mark attendance
  const markAttendance = useCallback(
    async (employeeId: number, status: "present" | "absent") => {
      try {
        const result = await apiMarkAttendance(employeeId, status);

        // Update the employee's attendance in local state
        setEmployees((prev) =>
          prev.map((emp) =>
            emp.id === employeeId ? { ...emp, today_attendance: status } : emp
          )
        );

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to mark attendance";
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    []
  );

  // Settle account
  const settleAccount = useCallback(async (employeeId: number) => {
    try {
      const result = await apiSettleAccount(employeeId);

      // Update the employee in local state
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === employeeId
            ? {
                ...emp,
                current_balance: result.employee.current_balance,
                payment_status: result.employee.payment_status,
                last_payment_date: result.employee.last_payment_date,
              }
            : emp
        )
      );

      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to settle account";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Refresh data
  const refresh = useCallback(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  return {
    employees,
    loading,
    error,
    addEmployee,
    addTransaction,
    markAttendance,
    settleAccount,
    refresh,
  };
};
