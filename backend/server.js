const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// In-Memory Database State
let db = {
  buses: {
    'Downtown Express': [
      { busNumber: '42', seats: Array(40).fill(null).map((_, i) => [2, 5].includes(i) ? 'Dummy Student' : null) },
      { busNumber: '43', seats: Array(40).fill(null) }
    ],
    'North Campus Loop': [
      { busNumber: '15', seats: Array(40).fill(null).map((_, i) => [1, 9, 39].includes(i) ? 'Emma Brown' : null) }
    ],
    'South City Route': [
      { busNumber: '08', seats: Array(40).fill(null) },
      { busNumber: '09', seats: Array(40).fill(null) }
    ]
  },
  reports: [
    { id: 1, type: 'Maintenance', desc: 'AC not working on Route 42', status: 'Active', by: 'Test Parent' }
  ],
  notifications: [
    'Your bus is arriving soon.',
    'Route changed due to traffic.',
    'Payment received for bus pass.'
  ],
  attendance: {
    'Alex Johnson': null,
    'Samantha Smith': null,
    'David Miller': null,
    'Emma Brown': null
  },
  students: [
    { id: 'ST101', name: 'Alex Johnson', feePaid: false, status: 'Active', bus: '42', route: 'Downtown Express' },
    { id: 'ST102', name: 'Emma Brown', feePaid: true, status: 'Active', bus: '15', route: 'North Campus Loop' },
    { id: 'ST103', name: 'Dummy Student', feePaid: true, status: 'Active', bus: '42', route: 'Downtown Express' },
    { id: 'ST104', name: 'Samantha Smith', feePaid: true, status: 'Active', bus: '08', route: 'South City Route' },
    { id: 'ST105', name: 'David Miller', feePaid: false, status: 'Paused', bus: '09', route: 'South City Route' }
  ],
  studentProfile: {
    name: 'Alex Johnson',
    id: 'STU-4921',
    course: 'B.Tech Computer Science',
    year: '3rd Year'
  },
  parentProfile: {
    name: 'Robert Johnson',
    relation: 'Father',
    phone: '+1 (555) 123-4567',
    email: 'robert.j@example.com'
  },
  // Used for Admin Dashboard
  stats: {
    fleet: 45,
    routes: 12,
    passengers: 1200,
    revenue: 8400,
    trends: [
      { name: 'Mon', passengers: 400, fuel: 240 },
      { name: 'Tue', passengers: 300, fuel: 139 },
      { name: 'Wed', passengers: 550, fuel: 380 },
      { name: 'Thu', passengers: 450, fuel: 390 },
      { name: 'Fri', passengers: 600, fuel: 480 },
    ]
  },
  // Used for tracking bus location mock (0-100% progress)
  busTracking: {
    progress: 0,
    eta: 15, // mins
    status: 'Moving',
    location: { lat: 28.5355, lng: 77.3910 }
  },
  seatRequests: [],
  busAvailability: { isAvailable: true, message: '' }
};

let simulationActive = true;
let lastNotifiedProgress = 0;

// Simulate Bus Moving automatically in background
setInterval(() => {
  if (simulationActive) {
    db.busTracking.progress += 5;
    if(db.busTracking.progress > 100) {
      db.busTracking.progress = 0;
    }
    db.busTracking.eta = Math.max(1, 15 - Math.floor(db.busTracking.progress / 7));
  }
}, 3000);

// ========================
// API Endpoints
// ========================

// COMMON ENDPOINTS
app.post('/api/report', (req, res) => {
  const { type, desc, by } = req.body;
  db.reports.unshift({
    id: Date.now(),
    type, desc, by, status: 'Active'
  });
  db.notifications.unshift(`New ${type} issue reported.`);
  res.json({ success: true, message: 'Report submitted successfully!' });
});

// Profile Update on Login (Simulated)
app.post('/api/login/update-profile', (req, res) => {
  const { role, identifier, studentId, studentCourse } = req.body;
  if (role === 'student' && studentId && studentCourse) {
    db.studentProfile.id = studentId;
    db.studentProfile.course = studentCourse;
    db.studentProfile.name = identifier.includes('@') ? identifier.split('@')[0] : 'Alex Johnson';
    
    // Also update or add to master database
    let student = db.students.find(s => s.id === studentId);
    if (!student) {
      student = { id: studentId, name: db.studentProfile.name, feePaid: false, status: 'Active', bus: 'TBD', route: 'TBD' };
      db.students.push(student);
    }
    if (student) student.route = studentCourse.includes('CS') ? 'Downtown Express' : 'North Campus Loop';
  }
  res.json({ success: true });
});

// Auto-Login (Mocked simple routing)
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username.includes('admin')) {
    return res.json({ role: 'admin', token: 'token-admin' });
  } else if (username.includes('student')) {
    return res.json({ role: 'student', token: 'token-student', name: 'Student 1' });
  } else if (username.includes('parent')) {
    return res.json({ role: 'parent', token: 'token-parent', childName: 'Alex Johnson' });
  } else if (username.includes('driver')) {
    return res.json({ role: 'driver', token: 'token-driver' });
  }
  // Default to admin for empty logic
  return res.json({ role: 'admin', token: 'token-admin' });
});

// STUDENT ENDPOINTS
app.get('/api/student/data', (req, res) => {
  res.json({
    buses: db.buses,
    notifications: db.notifications,
    tracking: db.busTracking,
    feePaid: db.students.find(s => s.name === db.studentProfile.name)?.feePaid || false,
    request: db.seatRequests.find(r => r.studentName === db.studentProfile.name) || null,
    availability: db.busAvailability,
    stops: [
      { id: 1, name: 'Campus Gate', progress: 10, eta: 45 },
      { id: 2, name: 'Downtown 5km approaching', progress: 25, eta: 30, isNear: true },
      { id: 3, name: 'Downtown Station', progress: 40, eta: 20 },
      { id: 4, name: 'South Mall 5km approaching', progress: 65, eta: 10, isNear: true },
      { id: 5, name: 'South Mall', progress: 85, eta: 2 }
    ],
    profile: db.studentProfile
  });
});

app.post('/api/student/pay', (req, res) => {
  const target = db.students.find(s => s.name === db.studentProfile.name);
  if(target) target.feePaid = true;
  db.notifications.unshift('Success: Bus pass fee paid.');
  res.json({ success: true, message: 'Fee paid successfully!' });
});

app.post('/api/student/reserve', (req, res) => {
  const { route, busIndex, seatIndex, studentName } = req.body;
  
  const student = db.students.find(s => s.name === studentName);
  if (!student || !student.feePaid) {
    return res.status(403).json({ success: false, message: 'Please pay the bus fee before reserving a seat.' });
  }
  if (student.status === 'Paused') {
    return res.status(403).json({ success: false, message: 'Your bus pass is currently paused by the Admin.' });
  }

  const routeBuses = db.buses[route];
  if (!routeBuses || !routeBuses[busIndex]) return res.status(404).json({ success: false, message: 'Route or Bus not found' });
  const bus = routeBuses[busIndex];

  // Lock seat change: If student already has a seat, they must contact Admin to change it.
  let alreadyHasSeat = false;
  Object.values(db.buses).flat().forEach(b => {
    if (b.seats.includes(studentName)) alreadyHasSeat = true;
  });

  if (alreadyHasSeat) {
    return res.status(403).json({ success: false, message: 'You already have a reserved seat. Please contact Admin for any changes.' });
  }

  if (bus.seats[seatIndex] === null) {
    bus.seats[seatIndex] = studentName;
    res.json({ success: true, message: `Seat ${seatIndex + 1} secured on Bus #${bus.busNumber}!`, buses: db.buses });
  } else {
    res.status(400).json({ success: false, message: 'Seat already taken by another student!' });
  }
});

app.post('/api/student/request-change', (req, res) => {
  const { studentName, reason } = req.body;
  const requestId = Date.now();
  db.seatRequests.push({ id: requestId, studentName, reason, status: 'Pending' });
  db.notifications.unshift(`New seat change request from ${studentName}.`);
  res.json({ success: true, message: 'Request sent to Admin for approval.' });
});

// PARENT ENDPOINTS
app.get('/api/parent/data', (req, res) => {
  res.json({
    childStatus: db.busTracking,
    attendance: db.attendance['Alex Johnson'],
    feePaid: db.students.find(s => s.name === 'Alex Johnson')?.feePaid || false,
    parentProfile: db.parentProfile,
    childProfile: db.studentProfile,
    busInfo: {
      busNumber: '42',
      route: 'Downtown Express',
      driverPhone: '+1 (555) 987-6543'
    },
    notifications: db.notifications,
    trips: [
      { date: 'Today, 8:00 AM', route: 'Route 42 (Downtown)', status: db.attendance['Alex Johnson'] ? 'Boarded' : 'Pending' },
      { date: 'Yesterday, 4:30 PM', route: 'Route B (South)', status: 'Completed' }
    ]
  });
});

app.post('/api/parent/pay', (req, res) => {
  const target = db.students.find(s => s.name === 'Alex Johnson');
  if(target) target.feePaid = true;
  db.notifications.unshift('Success: Bus pass fee paid by Parent.');
  res.json({ success: true, message: 'Fee paid successfully by Parent!' });
});

app.post('/api/parent/alert', (req, res) => {
  // console.log("EMERGENCY ALERT TRIGGERED BY PARENT!");
  db.notifications.unshift('EMERGENCY: Parent triggered an alert!');
  res.json({ success: true, message: 'Alert sent successfully!' });
});

// DRIVER ENDPOINTS
app.get('/api/driver/data', (req, res) => {
  res.json({
    attendance: db.attendance,
    routeStatus: db.busTracking,
    availability: db.busAvailability,
    stops: [
      { id: 1, name: 'Campus Gate', progress: 10, eta: 45 },
      { id: 2, name: 'Downtown 5km approaching', progress: 25, eta: 30, isNear: true },
      { id: 3, name: 'Downtown Station', progress: 40, eta: 20 },
      { id: 4, name: 'South Mall 5km approaching', progress: 65, eta: 10, isNear: true },
      { id: 5, name: 'South Mall', progress: 85, eta: 2 }
    ]
  });
});

app.post('/api/driver/issue', (req, res) => {
  const { type, desc } = req.body;
  const issueId = Date.now();
  db.reports.unshift({ id: issueId, type, desc, status: 'Active', by: 'Driver (Bus 42)' });
  db.notifications.unshift(`URGENT: Bus 42 reported ${type}! ${desc}`);
  db.busTracking.status = `Stopped (${type})`;
  res.json({ success: true, message: `Reported ${type} to system.` });
});

app.post('/api/driver/availability', (req, res) => {
  const { isAvailable, message } = req.body;
  db.busAvailability = { isAvailable, message };
  if (!isAvailable) {
    db.notifications.unshift(`HOLIDAY ALERT: Bus 42 not available today! ${message}`);
    db.busTracking.status = 'Not Running (Holiday)';
  } else {
    db.notifications.unshift(`System Update: Bus 42 is now back in service.`);
    db.busTracking.status = 'Ready';
  }
  res.json({ success: true, isAvailable });
});

app.post('/api/driver/location', (req, res) => {
  const { progress, eta, isHardwareGPS } = req.body;
  
  // Pause automatic background simulation gracefully
  simulationActive = false;
  
  // If no hardware pings for 30s, revert to simulation for demo purposes
  if (global.simTimeout) clearTimeout(global.simTimeout);
  global.simTimeout = setTimeout(() => { simulationActive = true; }, 30000);

  db.busTracking.progress = progress;
  db.busTracking.eta = eta !== undefined ? Math.max(1, Math.round(eta)) : Math.max(1, 15 - Math.floor(progress / 7));
  
  // Update mock lat/lng based on progress
  const baseLat = 28.5355;
  const baseLng = 77.3910;
  db.busTracking.location = { 
    lat: baseLat + (progress * 0.0002), 
    lng: baseLng + (progress * 0.0003) 
  };

  lastNotifiedProgress = progress - 1; 
  
  res.json({ success: true, message: isHardwareGPS ? 'Hardware GPS broadcasted successfully!' : 'Real-time location overridden.' });
});

app.post('/api/driver/attendance', (req, res) => {
  const { student, isPresent } = req.body;
  if(db.attendance[student] !== undefined) {
    db.attendance[student] = isPresent;
    res.json({ success: true, attendance: db.attendance });
  } else {
    res.status(400).json({ success: false, message: 'Student not found.' });
  }
});

// ADMIN ENDPOINTS
app.get('/api/admin/data', (req, res) => {
  res.json({ 
    ...db.stats, 
    buses: db.buses, 
    reports: db.reports, 
    students: db.students, 
    seatRequests: db.seatRequests,
    notifications: db.notifications 
  });
});

app.post('/api/admin/approve-change', (req, res) => {
  const { requestId, approve } = req.body;
  const request = db.seatRequests.find(r => r.id === requestId);
  if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

  if (approve) {
    // Clear student's current seat assignment to allow them to re-book
    Object.values(db.buses).flat().forEach(b => {
      for(let i=0; i<b.seats.length; i++) {
        if(b.seats[i] === request.studentName) b.seats[i] = null;
      }
    });
    request.status = 'Approved';
    db.notifications.unshift(`Success: Seat change approved for ${request.studentName}.`);
  } else {
    request.status = 'Rejected';
  }
  
  res.json({ success: true, seatRequests: db.seatRequests });
});

app.post('/api/admin/student/pay', (req, res) => {
  const { name } = req.body;
  const target = db.students.find(s => s.name === name);
  if(target) target.feePaid = !target.feePaid;
  res.json({ success: true, students: db.students });
});

app.post('/api/admin/student/pause', (req, res) => {
  const { name } = req.body;
  const target = db.students.find(s => s.name === name);
  if(target) target.status = target.status === 'Paused' ? 'Active' : 'Paused';
  res.json({ success: true, students: db.students });
});

app.post('/api/admin/student/remove', (req, res) => {
  const { name } = req.body;
  db.students = db.students.filter(s => s.name !== name);
  Object.values(db.buses).flat().forEach(b => {
    for(let i=0; i<b.seats.length; i++) {
      if(b.seats[i] === name) b.seats[i] = null;
    }
  });
  res.json({ success: true, students: db.students, buses: db.buses });
});

app.post('/api/admin/resolve', (req, res) => {
  const { id } = req.body;
  const report = db.reports.find(r => r.id === id);
  if (report) {
    report.status = 'Resolved';
    res.json({ success: true, message: 'Issue resolved.' });
  } else {
    res.status(404).json({ success: false, message: 'Report not found' });
  }
});

const PORT = process.env.PORT || 5005;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend API Server running gracefully on http://localhost:${PORT}`);
});
