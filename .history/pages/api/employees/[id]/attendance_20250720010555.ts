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
      const { status, attendance_date, check_in_time, check_out_time, notes } =
        req.body;

      if (!status || !["present", "absent"].includes(status)) {
        return res
          .status(400)
          .json({ error: "Valid status (present/absent) is required" });
      }

      // Check if employee exists
      const employee = await prisma.employee.findUnique({
        where: { id: employeeId, is_active: true },
      });

      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }

      const attendanceDate = attendance_date
        ? new Date(attendance_date)
        : new Date();

      // Use upsert to handle duplicate attendance records
      const attendance = await prisma.attendance.upsert({
        where: {
          employee_id_attendance_date: {
            employee_id: employeeId,
            attendance_date: attendanceDate,
          },
        },
        update: {
          status,
          check_in_time: check_in_time
            ? new Date(`1970-01-01T${check_in_time}`)
            : null,
          check_out_time: check_out_time
            ? new Date(`1970-01-01T${check_out_time}`)
            : null,
          notes,
        },
        create: {
          employee_id: employeeId,
          attendance_date: attendanceDate,
          status,
          check_in_time: check_in_time
            ? new Date(`1970-01-01T${check_in_time}`)
            : null,
          check_out_time: check_out_time
            ? new Date(`1970-01-01T${check_out_time}`)
            : null,
          notes,
        },
      });

      res.status(200).json({
        id: attendance.id,
        employee_id: attendance.employee_id,
        attendance_date: attendance.attendance_date.toISOString(),
        status: attendance.status,
        check_in_time: attendance.check_in_time?.toTimeString().split(" ")[0],
        check_out_time: attendance.check_out_time?.toTimeString().split(" ")[0],
        notes: attendance.notes,
        created_at: attendance.created_at.toISOString(),
      });
    } else {
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error("Attendance API Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
