export interface Employee {
  id: number;
  name: string;
  position: string;
  phone?: string | null;
  daily_wage: number;
  current_balance: number;
  total_bonuses: number;
  total_deductions: number;
  payment_status: "pending" | "paid" | "deferred";
  is_active: boolean;
  hire_date: string;
  last_payment_date?: string | null;
  created_at: string;
  updated_at: string;

  // Computed fields for UI
  today_attendance?: "present" | "absent";
  today_withdrawals?: number;
  today_bonuses?: number;
  today_deductions?: number;
  today_payments?: number;
}

export interface CreateEmployeeData {
  name: string;
  position: string;
  phone?: string;
  daily_wage: number;
}

export interface FinancialTransaction {
  transaction_type: "withdrawal" | "deduction" | "bonus" | "salary_payment";
  amount: number;
  description?: string;
  transaction_date: string;
}

export interface AttendanceData {
  status: "present" | "absent";
  attendance_date?: string;
  check_in_time?: string;
  check_out_time?: string;
  notes?: string;
}
