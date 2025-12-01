import React from 'react';

function StatusBadge({ status }) {
  const normalized = (status || '').toLowerCase();
  let bg = '#ccc';
  if (normalized === 'accepted') bg = '#16a34a';
  if (normalized === 'declined') bg = '#dc2626';
  if (normalized === 'ringing') bg = '#f59e0b';
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: 999,
        fontSize: 12,
        color: '#fff',
        backgroundColor: bg
      }}
    >
      {normalized || 'unknown'}
    </span>
  );
}

export default function AdminParticipantStatus({ participants }) {
  if (!participants || participants.length === 0) {
    return <div>No participants.</div>;
  }

  return (
    <table
      style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: 14
      }}
    >
      <thead>
        <tr>
          <th style={{ textAlign: 'left', padding: '4px 8px' }}>Employee ID</th>
          <th style={{ textAlign: 'left', padding: '4px 8px' }}>Email</th>
          <th style={{ textAlign: 'left', padding: '4px 8px' }}>Status</th>
        </tr>
      </thead>
      <tbody>
        {participants.map((p, idx) => (
          <tr key={p.employee_id || p.email || idx}>
            <td style={{ padding: '4px 8px', borderTop: '1px solid #eee' }}>
              {p.employee_id || '-'}
            </td>
            <td style={{ padding: '4px 8px', borderTop: '1px solid #eee' }}>
              {p.email || '-'}
            </td>
            <td style={{ padding: '4px 8px', borderTop: '1px solid #eee' }}>
              <StatusBadge status={p.status} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
