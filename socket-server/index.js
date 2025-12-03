const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');

const PORT = process.env.PORT || 4000;
const allowedOrigins = (process.env.SOCKET_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const app = express();
app.use(cors({
  origin: allowedOrigins.length ? allowedOrigins : '*',
  methods: ['GET', 'POST'],
  credentials: true,
}));
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins.length ? allowedOrigins : '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const activeCalls = {};
const userSockets = {};

function addSocketToUser(userId, socketId) {
  if (!userSockets[userId]) {
    userSockets[userId] = new Set();
  }
  userSockets[userId].add(socketId);
}

function removeSocketFromUser(userId, socketId) {
  const set = userSockets[userId];
  if (!set) return;
  set.delete(socketId);
  if (set.size === 0) {
    delete userSockets[userId];
  }
}

function createCall(payload) {
  let { call_id, admin_id, title, meet_url, participants } = payload;
  if (!call_id) {
    call_id = uuidv4();
  }
  const normalizedParticipants = (participants || []).map((p) => ({
    employee_id: p.employee_id || null,
    email: p.email,
    status: p.status || 'ringing'
  }));
  const call = {
    call_id,
    admin_id,
    title: title || 'Meeting',
    meet_url,
    participants: normalizedParticipants
  };
  activeCalls[call_id] = call;
  return call;
}

function updateParticipantStatus(call_id, employee_id, email, status) {
  const call = activeCalls[call_id];
  if (!call) return null;
  let participant =
    call.participants.find((p) => p.employee_id && p.employee_id === employee_id) ||
    call.participants.find((p) => email && p.email === email);
  if (!participant) {
    const newParticipant = {
      employee_id: employee_id || null,
      email: email || null,
      status
    };
    call.participants.push(newParticipant);
    participant = newParticipant;
  } else {
    participant.status = status;
  }
  return call;
}

function broadcastParticipantUpdate(call) {
  if (!call || !call.admin_id) return;
  io.to(call.admin_id).emit('call:participant-update', {
    call_id: call.call_id,
    participants: call.participants
  });
}

app.post('/emit', (req, res) => {
  try {
    const { admin_id, title, meet_url, participants } = req.body || {};
    console.log('[SOCKET-SERVER] /emit called with:', {
      admin_id,
      title,
      meet_url,
      participantsCount: Array.isArray(participants) ? participants.length : 'n/a',
    });
    if (!admin_id || !meet_url || !Array.isArray(participants)) {
      return res.status(400).json({
        success: false,
        error: 'admin_id, meet_url, and participants[] are required'
      });
    }
    const call = createCall({ admin_id, title, meet_url, participants });
    console.log('[SOCKET-SERVER] created call:', {
      call_id: call.call_id,
      admin_id: call.admin_id,
      participants: call.participants,
    });
    call.participants.forEach((p) => {
      const room = p.employee_id || p.email;
      if (!room) return;
      console.log('[SOCKET-SERVER] emitting call:ring to room', room, 'for participant', {
        employee_id: p.employee_id,
        email: p.email,
        status: p.status,
      });
      io.to(room).emit('call:ring', {
        call_id: call.call_id,
        admin_id: call.admin_id,
        title: call.title,
        meet_url: call.meet_url,
        participants: call.participants,
        target: {
          employee_id: p.employee_id,
          email: p.email
        }
      });
    });
    return res.json({
      success: true,
      call_id: call.call_id,
      participants: call.participants
    });
  } catch (e) {
    console.error('[SOCKET-SERVER] /emit error:', e);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

io.on('connection', (socket) => {
  console.log('[SOCKET-SERVER] client connected:', socket.id);

  socket.on('register', (payload) => {
    try {
      const { user_id, role } = payload || {};
      if (!user_id) return;
      socket.data.user_id = user_id;
      socket.data.role = role || 'employee';
      socket.join(user_id);
      addSocketToUser(user_id, socket.id);
      console.log('[SOCKET-SERVER] register:', user_id, socket.data.role);
    } catch (e) {
      console.error('[SOCKET-SERVER] register error:', e);
    }
  });

  socket.on('call:accepted', (payload) => {
    try {
      const { call_id, employee_id, email } = payload || {};
      if (!call_id) return;
      const call = updateParticipantStatus(call_id, employee_id, email, 'accepted');
      if (!call) return;
      broadcastParticipantUpdate(call);
    } catch (e) {
      console.error('[SOCKET-SERVER] call:accepted error:', e);
    }
  });

  socket.on('call:declined', (payload) => {
    try {
      const { call_id, employee_id, email } = payload || {};
      if (!call_id) return;
      const call = updateParticipantStatus(call_id, employee_id, email, 'declined');
      if (!call) return;
      broadcastParticipantUpdate(call);
    } catch (e) {
      console.error('[SOCKET-SERVER] call:declined error:', e);
    }
  });

  socket.on('disconnect', () => {
    const userId = socket.data.user_id;
    if (userId) {
      removeSocketFromUser(userId, socket.id);
    }
    console.log('[SOCKET-SERVER] client disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  const originLog = allowedOrigins.length ? allowedOrigins.join(', ') : '*';
  console.log(`[SOCKET-SERVER] listening on port ${PORT} (CORS origins: ${originLog})`);
});

module.exports = { activeCalls };
