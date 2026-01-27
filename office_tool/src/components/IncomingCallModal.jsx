import React from 'react';

export default function IncomingCallModal({ call, onAccept, onDecline }) {
  if (!call) return null;

  return (
    <div className="incoming-call-overlay">
      <div className="incoming-call-modal">
        <div className="incoming-call-header">
          <div className="incoming-call-icon-wrap" aria-hidden="true">
            <span>📞</span>
          </div>
          <div>
            <h2 className="incoming-call-title">
              {call.title || 'Incoming call'}
            </h2>
            <p className="incoming-call-subtitle">
              You are being invited to join a Google Meet.
            </p>
          </div>
        </div>
        <div className="incoming-call-body">
          When you join, your browser will open the meeting in a new tab.
        </div>
        <div className="incoming-call-actions">
          <button
            type="button"
            onClick={onDecline}
            className="incoming-call-btn incoming-call-btn-decline"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={onAccept}
            className="incoming-call-btn incoming-call-btn-join"
          >
            Join
          </button>
        </div>
      </div>
    </div>
  );
}
