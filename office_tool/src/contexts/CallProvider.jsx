import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { connectSocket } from '../socket';
import IncomingCallModal from '../components/IncomingCallModal';

const CallContext = createContext(null);

export function useCall() {
  return useContext(CallContext);
}

export function CallProvider({ userId, role = 'employee', children }) {
  const [incomingCall, setIncomingCall] = useState(null);
  const [adminUpdates, setAdminUpdates] = useState({});
  const socketRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = new Audio('/ringtone.mp3');
    audio.loop = true;
    audioRef.current = audio;
  }, []);

  const stopRingtone = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, []);

  useEffect(() => {
    if (!userId) return;
    const socket = connectSocket(userId, role);
    socketRef.current = socket;

    const handleRing = (payload) => {
      const { call_id, admin_id, title, meet_url } = payload;
      if (!meet_url) return;
      setIncomingCall({ callId: call_id, adminId: admin_id, title: title || 'Meeting', meetUrl: meet_url });
      const audio = audioRef.current;
      if (audio) {
        audio.play().catch(() => {});
      }
    };

    const handleParticipantUpdate = (payload) => {
      const { call_id, participants } = payload || {};
      if (!call_id) return;
      setAdminUpdates((prev) => ({ ...prev, [call_id]: participants || [] }));
    };

    const handleCancelled = (payload) => {
      try {
        const cancelledId = payload?.call_id;
        if (!cancelledId) return;
        if (incomingCall && String(incomingCall.callId) !== String(cancelledId)) return;
      } catch {
        // fall through
      }
      stopRingtone();
      setIncomingCall(null);
    };

    socket.on('call:ring', handleRing);
    socket.on('call:participant-update', handleParticipantUpdate);
    socket.on('call:cancelled', handleCancelled);

    return () => {
      socket.off('call:ring', handleRing);
      socket.off('call:participant-update', handleParticipantUpdate);
      socket.off('call:cancelled', handleCancelled);
    };
  }, [userId, role, incomingCall, stopRingtone]);

  const acceptCall = useCallback(() => {
    const call = incomingCall;
    const socket = socketRef.current;
    if (!call || !socket) return;
    stopRingtone();
    socket.emit('call:accepted', { call_id: call.callId, employee_id: userId });
    window.open(call.meetUrl, '_blank', 'noopener,noreferrer');
    setIncomingCall(null);
  }, [incomingCall, userId, stopRingtone]);

  const declineCall = useCallback(() => {
    const call = incomingCall;
    const socket = socketRef.current;
    if (!call || !socket) return;
    stopRingtone();
    socket.emit('call:declined', { call_id: call.callId, employee_id: userId });
    setIncomingCall(null);
  }, [incomingCall, userId, stopRingtone]);

  const value = {
    incomingCall,
    adminUpdates,
    acceptCall,
    declineCall
  };

  return (
    <CallContext.Provider value={value}>
      {children}
      {incomingCall && (
        <IncomingCallModal call={incomingCall} onAccept={acceptCall} onDecline={declineCall} />
      )}
    </CallContext.Provider>
  );
}
