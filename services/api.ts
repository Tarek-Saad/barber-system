import {
  Employee,
  CreateEmployeeData,
  FinancialTransaction,
  AttendanceData,
} from "../types/employee";

const API_BASE_URL = "/api";

// Helper function for API calls
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "API request failed" }));
    throw new Error(error.error || "API request failed");
  }

  return response.json();
}

// Employee APIs
export const apiGetEmployees = (): Promise<Employee[]> => {
  return apiCall<Employee[]>("/employees");
};

export const apiCreateEmployee = (
  data: CreateEmployeeData
): Promise<Employee> => {
  return apiCall<Employee>("/employees", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

// Transaction APIs
export const apiAddTransaction = (
  employeeId: number,
  data: FinancialTransaction
): Promise<any> => {
  return apiCall(`/employees/${employeeId}/transactions`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

// Attendance APIs
export const apiMarkAttendance = (
  employeeId: number,
  status: "present" | "absent",
  data?: Partial<AttendanceData>
): Promise<any> => {
  return apiCall(`/employees/${employeeId}/attendance`, {
    method: "POST",
    body: JSON.stringify({
      status,
      ...data,
    }),
  });
};

// Settlement APIs
export const apiSettleAccount = (employeeId: number): Promise<any> => {
  return apiCall(`/employees/${employeeId}/settle`, {
    method: "POST",
  });
};
