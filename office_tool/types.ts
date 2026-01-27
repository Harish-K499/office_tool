
export interface LeaveQuota {
    type: string;
    total: number;
    consumed: number;
}

export interface AttendanceDayData {
    day: number;
    status: string;
    isLate?: boolean;
    isManual?: boolean;
    isPending?: boolean;
    checkIn?: string;
    checkOut?: string;
    half?: string;
    EOP?: boolean;
}

export interface Employee {
    id: string;
    name: string;
    location: string;
    jobTitle: string;
    contactNumber: string;
    department: string;
    role: string;
    employmentType: string;
    status: string;
}

export interface Leave {
    id: number;
    title?: string;
    startDate: string;
    endDate: string;
    leaveType: string;
    appliedBy: string;
    approvalStatus: string;
    leaveCount: number;
    lopDays: number;
    appliedDate: string;
}

export interface Task {
    id: string;
    name: string;
    project: string;
    client: string;
    status: string;
    dueDate: string;
    priority: string;
    timeSpent: string;
}

export interface Timesheet {
    employeeId: string;
    name: string;
    total: string;
    logs: { [key: string]: string };
}

export interface AppState {
  user: { name: string; initials: string; id: string };
  timer: {
    intervalId: number | null;
    startTime: number | null;
    isRunning: boolean;
  };
  employees: Employee[];
  leaves: Leave[];
  leaveQuotas: LeaveQuota[];
  tasks: Task[];
  timesheet: Timesheet[];
  compOffs: CompOff[];
  compOffRequests: CompOffRequest[];
  currentAttendanceDate: Date;
  selectedAttendanceDay: number | null;
  attendanceFilter: string;
  attendanceData: {
    [employeeId: string]: { [day: number]: AttendanceDayData };
  };
}