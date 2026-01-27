import { AppState } from './types.js';

export const state: AppState = {
    user: { name: 'Vigneshraja S', initials: 'VS', id: 'EMP0001' },
    timer: {
        intervalId: null,
        startTime: null,
        isRunning: false,
    },
    employees: [
        { id: 'EMP0001', name: 'Vigneshraja S', location: 'New York', jobTitle: 'Frontend Engineer', department: 'Technology', role: 'Engineer', employmentType: 'Full-time', status: 'Active' },
        { id: 'EMP0002', name: 'Jane Smith', location: 'London', jobTitle: 'Backend Engineer', department: 'Technology', role: 'Engineer', employmentType: 'Full-time', status: 'Active' },
        { id: 'EMP0003', name: 'Peter Jones', location: 'New York', jobTitle: 'UI/UX Designer', department: 'Design', role: 'Designer', employmentType: 'Full-time', status: 'Active' },
        { id: 'EMP0004', name: 'Mary Johnson', location: 'Tokyo', jobTitle: 'Project Manager', department: 'Management', role: 'Manager', employmentType: 'Full-time', status: 'Inactive' },
    ],
    leaves: [
        { id: 1, title: 'Family function', startDate: '2025-10-21', endDate: '2025-10-21', leaveType: 'Casual Leave', appliedBy: 'Vigneshraja S', approvalStatus: 'Pending', leaveCount: 1, lopDays: 0, appliedDate: '2025-09-23' },
        { id: 2, title: 'Personal work', startDate: '2025-10-17', endDate: '2025-10-17', leaveType: 'Casual Leave', appliedBy: 'Vigneshraja S', approvalStatus: 'Approved', leaveCount: 1, lopDays: 0, appliedDate: '2025-09-23' },
        { id: 3, title: 'Doctor appointment', startDate: '2025-08-05', endDate: '2025-08-09', leaveType: 'Sick Leave', appliedBy: 'Vigneshraja S', approvalStatus: 'Approved', leaveCount: 5, lopDays: 1, appliedDate: '2025-07-13' },
    ],
    leaveQuotas: [
        { type: 'Casual Leave', total: 12, consumed: 4 },
        { type: 'Sick Leave', total: 10, consumed: 2 },
        { type: 'Comp off', total: 5, consumed: 1 },
    ],
    tasks: [],
    timesheet: [],
    currentAttendanceDate: new Date('2025-10-01'),
    selectedAttendanceDay: 1,
    attendanceFilter: 'week',
    attendanceData: {
        'EMP0001': {
            1: { day: 1, status: 'P', checkIn: '09:01', checkOut: '18:05', isLate: true },
            2: { day: 2, status: 'HL', half: 'FN' },
            3: { day: 3, status: 'A' },
            4: { day: 4, status: 'P', checkIn: '08:58', checkOut: '18:01' },
            5: { day: 5, status: 'DO' },
            6: { day: 6, status: 'DO' },
            7: { day: 7, status: 'P', checkIn: '09:00', checkOut: '18:00' },
            8: { day: 8, status: 'P', checkIn: '08:55', checkOut: '18:10', isLate: false },
            9: { day: 9, status: 'A' },
            10: { day: 10, status: 'SL' },
        },
        'EMP0002': {
            1: { day: 1, status: 'P', checkIn: '09:30', checkOut: '18:30', isLate: true, isManual: true },
            2: { day: 2, status: 'HL', half: 'FN' },
            3: { day: 3, status: 'P', checkIn: '08:45', checkOut: '18:00' },
            4: { day: 4, status: 'P', checkIn: '09:00', checkOut: '18:00' },
            5: { day: 5, status: 'DO' },
        },
        'EMP0003': {
            1: { day: 1, status: 'P', checkIn: '09:05', checkOut: '18:00' },
            2: { day: 2, status: 'A' },
            3: { day: 3, status: 'SL' },
            4: { day: 4, status: 'P', checkIn: '09:02', checkOut: '17:45' },
            5: { day: 5, status: 'DO' },
        }
    }
};