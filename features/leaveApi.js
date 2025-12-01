// features/leaveApi.js

const BASE_URL = 'http://localhost:5000';

export async function fetchEmployeeLeaves(employeeId) {
  try {
    // Add cache-busting timestamp to ensure fresh data
    const timestamp = new Date().getTime();
    const res = await fetch(`${BASE_URL}/api/leaves/${employeeId}?_t=${timestamp}`, {
      cache: 'no-cache',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    if (!res.ok) {
      console.error(`❌ HTTP Error: ${res.status} ${res.statusText}`);
      throw new Error(`Failed to fetch leaves: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    if (!data.success) {
      console.error('❌ API returned error:', data.error);
      throw new Error(data.error || 'Failed to fetch leaves');
    }
    console.log(`✅ Successfully fetched ${data.leaves?.length || 0} leave records`);
    return data.leaves || [];
  } catch (error) {
    console.error('❌ Error in fetchEmployeeLeaves:', error);
    throw error;
  }
}

export async function applyLeave(leaveData) {
  const res = await fetch(`${BASE_URL}/api/apply-leave`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(leaveData)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to apply leave');
  }
  return data;
}

export async function fetchLeaveBalance(employeeId, leaveType) {
  // Try path style first, then query fallback
  let res = await fetch(`${BASE_URL}/api/leave-balance/${encodeURIComponent(employeeId)}/${encodeURIComponent(leaveType)}`);
  if (!res.ok) {
    res = await fetch(`${BASE_URL}/api/leave-balance?employee_id=${encodeURIComponent(employeeId)}&leave_type=${encodeURIComponent(leaveType)}`);
  }
  if (!res.ok) {
    throw new Error(`Failed to fetch leave balance: ${res.status}`);
  }
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch leave balance');
  }
  return data.available || 0;
}

export async function fetchAllLeaveBalances(employeeId) {
  try {
    console.log(`🔄 Fetching all leave balances for employee: ${employeeId}`);
    const res = await fetch(`${BASE_URL}/api/leave-balance/all/${encodeURIComponent(employeeId)}`, {
      cache: 'no-cache',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    if (!res.ok) {
      console.error(`❌ HTTP Error: ${res.status} ${res.statusText}`);
      throw new Error(`Failed to fetch leave balances: ${res.status}`);
    }
    
    const data = await res.json();
    if (!data.success) {
      console.error('❌ API returned error:', data.error);
      throw new Error(data.error || 'Failed to fetch leave balances');
    }
    
    console.log(`✅ Successfully fetched leave balances:`, data.balances);
    return data.balances || [];
  } catch (error) {
    console.error('❌ Error in fetchAllLeaveBalances:', error);
    throw error;
  }
}

export async function fetchPendingLeaves() {
  try {
    console.log('🔄 Fetching pending leave requests...');
    const res = await fetch(`${BASE_URL}/api/leaves/pending`, {
      cache: 'no-cache',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    if (!res.ok) {
      console.error(`❌ HTTP Error: ${res.status} ${res.statusText}`);
      throw new Error(`Failed to fetch pending leaves: ${res.status}`);
    }
    
    const data = await res.json();
    if (!data.success) {
      console.error('❌ API returned error:', data.error);
      throw new Error(data.error || 'Failed to fetch pending leaves');
    }
    
    console.log(`✅ Successfully fetched ${data.leaves?.length || 0} pending leave requests`);
    return data.leaves || [];
  } catch (error) {
    console.error('❌ Error in fetchPendingLeaves:', error);
    throw error;
  }
}

export async function approveLeave(leaveId, approvedBy) {
  try {
    console.log(`✅ Approving leave: ${leaveId} by ${approvedBy}`);
    const res = await fetch(`${BASE_URL}/api/leaves/approve/${encodeURIComponent(leaveId)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ approved_by: approvedBy })
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      console.error(`❌ Failed to approve leave: ${res.status}`, data);
      throw new Error(data.error || 'Failed to approve leave');
    }
    
    if (!data.success) {
      console.error('❌ API returned error:', data.error);
      throw new Error(data.error || 'Failed to approve leave');
    }
    
    console.log(`✅ Leave ${leaveId} approved successfully`);
    return data;
  } catch (error) {
    console.error('❌ Error in approveLeave:', error);
    throw error;
  }
}

export async function rejectLeave(leaveId, rejectedBy, reason = '') {
  try {
    console.log(`❌ Rejecting leave: ${leaveId} by ${rejectedBy}`);
    if (reason) {
      console.log(`💬 Rejection reason: ${reason}`);
    }
    
    const res = await fetch(`${BASE_URL}/api/leaves/reject/${encodeURIComponent(leaveId)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        rejected_by: rejectedBy,
        reason: reason 
      })
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      console.error(`❌ Failed to reject leave: ${res.status}`, data);
      throw new Error(data.error || 'Failed to reject leave');
    }
    
    if (!data.success) {
      console.error('❌ API returned error:', data.error);
      throw new Error(data.error || 'Failed to reject leave');
    }
    
    console.log(`✅ Leave ${leaveId} rejected successfully`);
    return data;
  } catch (error) {
    console.error('❌ Error in rejectLeave:', error);
    throw error;
  }
}
