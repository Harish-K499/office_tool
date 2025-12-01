// // import { state } from '../state.js';
// // import { listEmployees } from '../features/employeeApi.js';
// // import { startNotificationPolling } from '../features/notificationApi.js';

// // export const renderLoginPage = () => {
// //     const content = `
// //         <button id="theme-toggle" class="theme-toggle" aria-label="Toggle Theme">
// //             <svg class="toggle-icon sun-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
// //                 <circle cx="12" cy="12" r="5"></circle>
// //                 <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path>
// //             </svg>
// //             <svg class="toggle-icon moon-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
// //                 <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
// //             </svg>
// //         </button>

// //         <div class="app-container split-layout">
// //             <div class="robot-section">
// //                 <div class="celestial-wrapper">
// //                     <svg class="celestial-body sun" viewBox="0 0 100 100">
// //                         <circle cx="50" cy="50" r="30" fill="#FDB813" />
// //                         <g stroke="#FDB813" stroke-width="4" stroke-linecap="round">
// //                             <line x1="50" y1="10" x2="50" y2="5" />
// //                             <line x1="50" y1="90" x2="50" y2="95" />
// //                             <line x1="10" y1="50" x2="5" y2="50" />
// //                             <line x1="90" y1="50" x2="95" y2="50" />
// //                             <line x1="22" y1="22" x2="18" y2="18" />
// //                             <line x1="78" y1="78" x2="82" y2="82" />
// //                             <line x1="22" y1="78" x2="18" y2="82" />
// //                             <line x1="78" y1="22" x2="82" y2="18" />
// //                         </g>
// //                     </svg>
// //                     <svg class="celestial-body moon" viewBox="0 0 100 100">
// //                         <path d="M50 15 A 35 35 0 1 0 85 50 A 28 28 0 1 1 50 15" fill="#F4F6F0" />
// //                         <circle cx="30" cy="40" r="3" fill="#E0E0E0" opacity="0.5" />
// //                         <circle cx="60" cy="70" r="5" fill="#E0E0E0" opacity="0.5" />
// //                         <circle cx="45" cy="60" r="2" fill="#E0E0E0" opacity="0.5" />
// //                     </svg>
// //                 </div>

// //                 <svg id="robot" viewBox="0 0 400 600" xmlns="http://www.w3.org/2000/svg">
// //                     <defs>
// //                         <linearGradient id="metal-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
// //                             <stop offset="0%" stop-color="#e2e8f0" />
// //                             <stop offset="50%" stop-color="#94a3b8" />
// //                             <stop offset="100%" stop-color="#475569" />
// //                         </linearGradient>
// //                         <linearGradient id="metal-dark" x1="0%" y1="0%" x2="0%" y2="100%">
// //                             <stop offset="0%" stop-color="#475569" />
// //                             <stop offset="100%" stop-color="#1e293b" />
// //                         </linearGradient>
// //                         <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
// //                             <feGaussianBlur stdDeviation="4" result="coloredBlur" />
// //                             <feMerge>
// //                                 <feMergeNode in="coloredBlur" />
// //                                 <feMergeNode in="SourceGraphic" />
// //                             </feMerge>
// //                         </filter>
// //                         <linearGradient id="screen-shine" x1="0%" y1="0%" x2="100%" y2="100%">
// //                             <stop offset="0%" stop-color="rgba(255,255,255,0.1)" />
// //                             <stop offset="45%" stop-color="rgba(255,255,255,0)" />
// //                             <stop offset="55%" stop-color="rgba(255,255,255,0)" />
// //                             <stop offset="100%" stop-color="rgba(255,255,255,0.05)" />
// //                         </linearGradient>
// //                     </defs>
// //                     <g id="robot-group">
// //                         <rect x="180" y="230" width="40" height="40" fill="url(#metal-dark)" rx="5" />
// //                         <path d="M 180 240 L 220 240" stroke="#334155" stroke-width="2" />
// //                         <path d="M 180 250 L 220 250" stroke="#334155" stroke-width="2" />
// //                         <path d="M 180 260 L 220 260" stroke="#334155" stroke-width="2" />
// //                         <path d="M 100 270 Q 200 250 300 270 L 280 500 Q 200 520 120 500 Z" fill="url(#metal-gradient)" stroke="#334155" stroke-width="2" />
// //                         <path d="M 140 300 L 260 300 L 250 420 L 150 420 Z" fill="#1e293b" stroke="#475569" stroke-width="2" />
// //                         <circle cx="200" cy="360" r="25" fill="#1e1b4b" stroke="#312e81" stroke-width="2" />
// //                         <circle cx="200" cy="360" r="15" fill="#6366f1" filter="url(#glow)" class="power-core" />
// //                         <circle cx="90" cy="290" r="25" fill="url(#metal-dark)" />
// //                         <circle cx="310" cy="290" r="25" fill="url(#metal-dark)" />
// //                         <path d="M 90 290 Q 50 350 60 420" stroke="url(#metal-gradient)" stroke-width="24" stroke-linecap="round" fill="none" />
// //                         <path d="M 310 290 Q 350 350 340 420" stroke="url(#metal-gradient)" stroke-width="24" stroke-linecap="round" fill="none" />
// //                         <circle cx="60" cy="420" r="18" fill="#334155" />
// //                         <circle cx="340" cy="420" r="18" fill="#334155" />
// //                         <g id="robot-head-group" transform="translate(0, 0)">
// //                             <line x1="200" y1="100" x2="200" y2="50" stroke="#94a3b8" stroke-width="4" />
// //                             <circle cx="200" cy="45" r="6" fill="#ef4444" class="antenna-light" filter="url(#glow)" />
// //                             <rect x="110" y="100" width="180" height="150" rx="40" fill="url(#metal-gradient)" stroke="#94a3b8" stroke-width="2" />
// //                             <rect x="90" y="150" width="20" height="50" rx="5" fill="#475569" />
// //                             <rect x="290" y="150" width="20" height="50" rx="5" fill="#475569" />
// //                             <rect x="125" y="120" width="150" height="100" rx="25" fill="#0f172a" stroke="#1e293b" stroke-width="4" />
// //                             <g id="eyes">
// //                                 <g class="eye" transform="translate(160, 160)">
// //                                     <rect x="-18" y="-18" width="36" height="36" rx="10" fill="#00ff9d" class="eye-shape" filter="url(#glow)" />
// //                                     <rect x="-5" y="-5" width="10" height="10" rx="2" fill="#003d24" class="pupil" opacity="0.7" />
// //                                 </g>
// //                                 <g class="eye" transform="translate(240, 160)">
// //                                     <rect x="-18" y="-18" width="36" height="36" rx="10" fill="#00ff9d" class="eye-shape" filter="url(#glow)" />
// //                                     <rect x="-5" y="-5" width="10" height="10" rx="2" fill="#003d24" class="pupil" opacity="0.7" />
// //                                 </g>
// //                             </g>
// //                             <rect x="125" y="120" width="150" height="100" rx="25" fill="url(#screen-shine)" pointer-events="none" />
// //                             <path id="mouth" d="M 170 200 Q 200 210 230 200" stroke="#00ff9d" stroke-width="3" stroke-linecap="round" fill="none" filter="url(#glow)" opacity="0.8" />
// //                         </g>
// //                     </g>
// //                 </svg>
// //             </div>

// //             <div class="login-section">
// //                 <div class="login-wrapper">
// //                     <div class="login-card">
// //                         <div class="brand">
// //                             <h1>VTab Square</h1>
// //                             <p>Welcome back, Commander.</p>
// //                         </div>
// //                         <form id="login-form">
// //                             <div class="input-group email-group">
// //                                 <label for="login-email">Email</label>
// //                                 <div class="input-wrapper" id="email-wrapper">
// //                                     <svg id="mini-robot" viewBox="0 0 100 100" class="mini-robot">
// //                                         <defs>
// //                                             <linearGradient id="mini-metal" x1="0%" y1="0%" x2="100%" y2="100%">
// //                                                 <stop offset="0%" style="stop-color:var(--text-secondary);stop-opacity:1" />
// //                                                 <stop offset="100%" style="stop-color:var(--text-muted);stop-opacity:1" />
// //                                             </linearGradient>
// //                                         </defs>
// //                                         <rect x="15" y="30" width="70" height="55" rx="15" fill="url(#mini-metal)" stroke="#475569" stroke-width="2" />
// //                                         <rect x="20" y="45" width="60" height="20" rx="8" fill="#0f172a" />
// //                                         <circle class="mini-eye left" cx="35" cy="55" r="6" fill="#00ff9d" />
// //                                         <circle class="mini-eye right" cx="65" cy="55" r="6" fill="#00ff9d" />
// //                                         <path d="M25 48 Q 30 48 35 50" stroke="rgba(255,255,255,0.3)" stroke-width="2" fill="none" />
// //                                         <line x1="30" y1="30" x2="25" y2="10" stroke="#64748b" stroke-width="2" />
// //                                         <line x1="70" y1="30" x2="75" y2="10" stroke="#64748b" stroke-width="2" />
// //                                         <circle cx="25" cy="10" r="3" fill="#ef4444" />
// //                                         <circle cx="75" cy="10" r="3" fill="#ef4444" />
// //                                     </svg>
// //                                     <svg class="mini-hands" viewBox="0 0 100 100">
// //                                         <circle cx="15" cy="15" r="8" fill="#cbd5e1" stroke="#475569" stroke-width="2" />
// //                                         <circle cx="85" cy="15" r="8" fill="#cbd5e1" stroke="#475569" stroke-width="2" />
// //                                     </svg>
// //                                     <input type="email" id="login-email" name="email" placeholder="name@vtab.com" required autocomplete="off">
// //                                 </div>
// //                             </div>
// //                             <div class="input-group">
// //                                 <label for="login-password">Password</label>
// //                                 <div class="password-wrapper">
// //                                     <input type="password" id="login-password" name="password" placeholder="••••••••" required>
// //                                     <button type="button" class="icon-btn" id="toggle-password">
// //                                         <svg class="eye-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
// //                                             <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
// //                                             <circle cx="12" cy="12" r="3"></circle>
// //                                         </svg>
// //                                         <svg class="eye-off-icon hidden" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
// //                                             <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
// //                                             <line x1="1" y1="1" x2="23" y2="23"></line>
// //                                         </svg>
// //                                     </button>
// //                                 </div>
// //                             </div>
// //                             <button type="submit" class="login-btn" id="login-btn">
// //                                 <span class="btn-text">Login</span>
// //                                 <div class="loader hidden"></div>
// //                             </button>
// //                             <p id="login-error" class="login-error" style="display:none;"></p>
// //                         </form>
// //                         <div class="footer">
// //                             <p>Secure Access Terminal v2.0</p>
// //                         </div>
// //                     </div>
// //                 </div>
// //             </div>
// //         </div>
// //     `;
// //     document.getElementById('app-content').innerHTML = content;

// //     const form = document.getElementById('login-form');
// //     const err = document.getElementById('login-error');
// //     const loginBtn = document.getElementById('login-btn');
// //     const btnText = loginBtn.querySelector('.btn-text');
// //     const loader = loginBtn.querySelector('.loader');
// //     const emailInput = document.getElementById('login-email');
// //     const passwordInput = document.getElementById('login-password');
// //     const robot = document.getElementById('robot');
// //     const robotHead = document.getElementById('robot-head-group');
// //     const eyes = document.querySelectorAll('.eye');
// //     const pupils = document.querySelectorAll('.pupil');

// //     // Robot Eye Tracking
// //     document.addEventListener('mousemove', (e) => {
// //         if (!robotHead) return;
// //         const rekt = robot.getBoundingClientRect();
// //         const robotHeadX = rekt.left + rekt.width * 0.5;
// //         const robotHeadY = rekt.top + rekt.height * 0.3;
// //         const mouseX = e.clientX;
// //         const mouseY = e.clientY;
// //         const angleDeg = angle(mouseX, mouseY, robotHeadX, robotHeadY);
// //         const maxDist = 14;
// //         const dist = Math.min(distance(mouseX, mouseY, robotHeadX, robotHeadY) / 25, maxDist);
// //         const x = Math.cos(angleDeg * Math.PI / 180) * dist;
// //         const y = Math.sin(angleDeg * Math.PI / 180) * dist;
// //         pupils.forEach(pupil => pupil.setAttribute('transform', `translate(${x}, ${y})`));
// //         const headX = Math.max(Math.min((mouseX - window.innerWidth / 2) / 60, 15), -15);
// //         const headY = Math.max(Math.min((mouseY - window.innerHeight / 2) / 60, 10), -10);
// //         robotHead.setAttribute('transform', `translate(${headX}, ${headY})`);
// //     });

// //     function angle(cx, cy, ex, ey) {
// //         const dy = cy - ey;
// //         const dx = cx - ex;
// //         return Math.atan2(dy, dx) * 180 / Math.PI;
// //     }

// //     function distance(x1, y1, x2, y2) {
// //         return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
// //     }

// //     // Blinking
// //     function blink() {
// //         if (robot.classList.contains('robot-error') || robot.classList.contains('robot-success')) return;
// //         eyes.forEach(eye => eye.classList.add('blink'));
// //         setTimeout(() => eyes.forEach(eye => eye.classList.remove('blink')), 150);
// //         setTimeout(blink, Math.random() * 4000 + 2000);
// //     }
// //     setTimeout(blink, 3000);

// //     // Mouse Spotlight & 3D Tilt
// //     const loginCard = document.querySelector('.login-card');
// //     document.addEventListener('mousemove', (e) => {
// //         const x = e.clientX;
// //         const y = e.clientY;
// //         document.body.style.setProperty('--mouse-x', `${x}px`);
// //         document.body.style.setProperty('--mouse-y', `${y}px`);
// //         if (loginCard) {
// //             const rect = loginCard.getBoundingClientRect();
// //             const cardX = rect.left + rect.width / 2;
// //             const cardY = rect.top + rect.height / 2;
// //             const angleX = (y - cardY) / 25;
// //             const angleY = (cardX - x) / 25;
// //             loginCard.style.transform = `rotateX(${angleX}deg) rotateY(${angleY}deg)`;
// //             loginCard.style.setProperty('--border-x', `${x - rect.left}px`);
// //             loginCard.style.setProperty('--border-y', `${y - rect.top}px`);
// //         }
// //     });
// //     document.addEventListener('mouseleave', () => {
// //         if (loginCard) loginCard.style.transform = 'rotateX(0) rotateY(0)';
// //     });

// //     // Magnetic Button
// //     loginBtn.addEventListener('mousemove', (e) => {
// //         const rect = loginBtn.getBoundingClientRect();
// //         const x = e.clientX - rect.left - rect.width / 2;
// //         const y = e.clientY - rect.top - rect.height / 2;
// //         const intensity = 0.08; // softer magnetic effect
// //         loginBtn.style.transform = `translate(${x * intensity}px, ${y * intensity}px)`;
// //     });
// //     loginBtn.addEventListener('mouseleave', () => {
// //         loginBtn.style.transform = 'translate(0, 0)';
// //     });

// //     // Mini Robot
// //     const miniRobot = document.getElementById('mini-robot');
// //     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// //     emailInput.addEventListener('input', (e) => {
// //         if (emailRegex.test(e.target.value)) {
// //             if (!miniRobot.classList.contains('bounce')) {
// //                 miniRobot.classList.add('bounce');
// //                 setTimeout(() => miniRobot.classList.remove('bounce'), 1000);
// //             }
// //         }
// //     });

// //     // Theme Toggle
// //     const themeToggle = document.getElementById('theme-toggle');
// //     const body = document.body;
// //     if (localStorage.getItem('theme') === 'light') {
// //         body.classList.add('light-mode');
// //     }
// //     themeToggle.addEventListener('click', () => {
// //         body.classList.toggle('light-mode');
// //         robot.classList.add('celebrate');
// //         setTimeout(() => robot.classList.remove('celebrate'), 800);
// //         localStorage.setItem('theme', body.classList.contains('light-mode') ? 'light' : 'dark');
// //     });

// //     // Mini Robot Peek
// //     const miniEyes = document.querySelectorAll('.mini-eye');
// //     const emailWrapper = document.getElementById('email-wrapper');
// //     emailInput.addEventListener('focus', () => emailWrapper.classList.add('peek'));
// //     emailInput.addEventListener('blur', () => emailWrapper.classList.remove('peek'));

// //     // Robot Typing Effect
// //     [emailInput, passwordInput].forEach(input => {
// //         input.addEventListener('input', (e) => {
// //             robot.classList.add('robot-typing');
// //             clearTimeout(input.typingTimeout);
// //             input.typingTimeout = setTimeout(() => robot.classList.remove('robot-typing'), 500);
// //             if (input === emailInput) {
// //                 const length = e.target.value.length;
// //                 const progress = Math.min(length, 30) / 30;
// //                 const currentOffset = -6 + (progress * 12);
// //                 miniEyes.forEach(eye => {
// //                     const baseCx = eye.classList.contains('left') ? 35 : 65;
// //                     eye.setAttribute('cx', baseCx + currentOffset);
// //                 });
// //             }
// //         });
// //     });

// //     passwordInput.addEventListener('focus', () => robot.classList.add('robot-smile'));
// //     passwordInput.addEventListener('blur', () => robot.classList.remove('robot-smile'));

// //     // Password Toggle
// //     const toggleBtn = document.getElementById('toggle-password');
// //     const eyeIcon = document.querySelector('.eye-icon');
// //     const eyeOffIcon = document.querySelector('.eye-off-icon');
// //     toggleBtn.addEventListener('click', () => {
// //         const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
// //         passwordInput.setAttribute('type', type);
// //         if (type === 'text') {
// //             eyeIcon.classList.add('hidden');
// //             eyeOffIcon.classList.remove('hidden');
// //         } else {
// //             eyeIcon.classList.remove('hidden');
// //             eyeOffIcon.classList.add('hidden');
// //         }
// //     });

// //     // Login Logic (PRESERVED)
// //     form.addEventListener('submit', async (e) => {
// //         e.preventDefault();
// //         err.style.display = 'none';
// //         const email = emailInput.value.trim();
// //         const password = passwordInput.value;

// //         if (!email || !password) {
// //             err.textContent = 'Email and password are required';
// //             err.style.display = 'block';
// //             handleError();
// //             return;
// //         }

// //         loginBtn.disabled = true;
// //         btnText.classList.add('hidden');
// //         loader.classList.remove('hidden');

// //         try {
// //             const res = await fetch('http://localhost:5000/api/login', {
// //                 method: 'POST',
// //                 headers: { 'Content-Type': 'application/json' },
// //                 body: JSON.stringify({ username: email, password })
// //             });
// //             const data = await res.json();

// //             if (!res.ok) {
// //                 loginBtn.disabled = false;
// //                 btnText.classList.remove('hidden');
// //                 loader.classList.add('hidden');
// //                 err.textContent = data.message || 'Login failed';
// //                 err.style.display = 'block';
// //                 handleError();
// //                 return;
// //             }

// //             handleSuccess();

// //             const u = data.user || {};
// //             const displayName = u.name || u.full_name || u.username || email;
// //             const empId = u.employee_id || u.id || u.emp_id || u.email || email;
// //             state.user = {
// //                 name: displayName,
// //                 initials: String(displayName).split(' ').map(x => x[0]).join('').slice(0, 2).toUpperCase() || 'US',
// //                 id: empId,
// //                 email,
// //                 designation: u.designation || '',
// //                 is_admin: !!u.is_admin
// //             };
// //             state.authenticated = true;
// //             try {
// //                 localStorage.setItem('auth', JSON.stringify({ authenticated: true, user: state.user }));
// //             } catch { }

// //             try {
// //                 const all = await listEmployees(1, 5000);
// //                 const match = (all.items || []).find(e => (e.email || '').toLowerCase() === email.toLowerCase());
// //                 if (match && match.employee_id) {
// //                     state.user.id = match.employee_id;
// //                     try { localStorage.setItem('auth', JSON.stringify({ authenticated: true, user: state.user })); } catch { }
// //                 }
// //             } catch { }

// //             startNotificationPolling();

// //             setTimeout(() => {
// //                 const appContent = document.getElementById('app-content');
// //                 if (appContent) appContent.classList.add('page-exit-anim');
// //                 setTimeout(() => {
// //                     window.location.href = '/index.html#/';
// //                 }, 900);
// //             }, 1000);

// //         } catch (ex) {
// //             loginBtn.disabled = false;
// //             btnText.classList.remove('hidden');
// //             loader.classList.add('hidden');
// //             err.textContent = ex.message || 'Unexpected error';
// //             err.style.display = 'block';
// //             handleError();
// //         }
// //     });

// //     function handleError() {
// //         robot.classList.remove('robot-success');
// //         robot.classList.add('robot-error');
// //         robot.classList.add('shake');
// //         setTimeout(() => robot.classList.remove('shake'), 500);
// //         setTimeout(() => robot.classList.remove('robot-error'), 2000);
// //     }

// //     function handleSuccess() {
// //         robot.classList.remove('robot-error');
// //         robot.classList.add('robot-success');
// //         btnText.textContent = 'Access Granted';
// //         btnText.classList.remove('hidden');
// //         loader.classList.add('hidden');
// //     }
// // };

// import { state } from '../state.js';
// import { listEmployees } from '../features/employeeApi.js';
// import { startNotificationPolling } from '../features/notificationApi.js';

// export const renderLoginPage = () => {
//     const content = `
//         <button id="theme-toggle" class="theme-toggle" aria-label="Toggle Theme">
//             <svg class="toggle-icon sun-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
//                 <circle cx="12" cy="12" r="5"></circle>
//                 <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path>
//             </svg>
//             <svg class="toggle-icon moon-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
//                 <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
//             </svg>
//         </button>

//         <div class="app-container split-layout">
//             <div class="robot-section">
//                 <div class="celestial-wrapper">
//                     <svg class="celestial-body sun" viewBox="0 0 100 100">
//                         <circle cx="50" cy="50" r="30" fill="#FDB813" />
//                         <g stroke="#FDB813" stroke-width="4" stroke-linecap="round">
//                             <line x1="50" y1="10" x2="50" y2="5" />
//                             <line x1="50" y1="90" x2="50" y2="95" />
//                             <line x1="10" y1="50" x2="5" y2="50" />
//                             <line x1="90" y1="50" x2="95" y2="50" />
//                             <line x1="22" y1="22" x2="18" y2="18" />
//                             <line x1="78" y1="78" x2="82" y2="82" />
//                             <line x1="22" y1="78" x2="18" y2="82" />
//                             <line x1="78" y1="22" x2="82" y2="18" />
//                         </g>
//                     </svg>
//                     <svg class="celestial-body moon" viewBox="0 0 100 100">
//                         <path d="M50 15 A 35 35 0 1 0 85 50 A 28 28 0 1 1 50 15" fill="#F4F6F0" />
//                         <circle cx="30" cy="40" r="3" fill="#E0E0E0" opacity="0.5" />
//                         <circle cx="60" cy="70" r="5" fill="#E0E0E0" opacity="0.5" />
//                         <circle cx="45" cy="60" r="2" fill="#E0E0E0" opacity="0.5" />
//                     </svg>
//                 </div>

//                 <svg id="robot" viewBox="0 0 400 600" xmlns="http://www.w3.org/2000/svg">
//                     <defs>
//                         <linearGradient id="metal-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
//                             <stop offset="0%" stop-color="#e2e8f0" />
//                             <stop offset="50%" stop-color="#94a3b8" />
//                             <stop offset="100%" stop-color="#475569" />
//                         </linearGradient>
//                         <linearGradient id="metal-dark" x1="0%" y1="0%" x2="0%" y2="100%">
//                             <stop offset="0%" stop-color="#475569" />
//                             <stop offset="100%" stop-color="#1e293b" />
//                         </linearGradient>
//                         <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
//                             <feGaussianBlur stdDeviation="4" result="coloredBlur" />
//                             <feMerge>
//                                 <feMergeNode in="coloredBlur" />
//                                 <feMergeNode in="SourceGraphic" />
//                             </feMerge>
//                         </filter>
//                         <linearGradient id="screen-shine" x1="0%" y1="0%" x2="100%" y2="100%">
//                             <stop offset="0%" stop-color="rgba(255,255,255,0.1)" />
//                             <stop offset="45%" stop-color="rgba(255,255,255,0)" />
//                             <stop offset="55%" stop-color="rgba(255,255,255,0)" />
//                             <stop offset="100%" stop-color="rgba(255,255,255,0.05)" />
//                         </linearGradient>
//                     </defs>
//                     <g id="robot-group">
//                         <rect x="180" y="230" width="40" height="40" fill="url(#metal-dark)" rx="5" />
//                         <path d="M 180 240 L 220 240" stroke="#334155" stroke-width="2" />
//                         <path d="M 180 250 L 220 250" stroke="#334155" stroke-width="2" />
//                         <path d="M 180 260 L 220 260" stroke="#334155" stroke-width="2" />
//                         <path d="M 100 270 Q 200 250 300 270 L 280 500 Q 200 520 120 500 Z" fill="url(#metal-gradient)" stroke="#334155" stroke-width="2" />
//                         <path d="M 140 300 L 260 300 L 250 420 L 150 420 Z" fill="#1e293b" stroke="#475569" stroke-width="2" />
//                         <circle cx="200" cy="360" r="25" fill="#1e1b4b" stroke="#312e81" stroke-width="2" />
//                         <circle cx="200" cy="360" r="15" fill="#6366f1" filter="url(#glow)" class="power-core" />
//                         <circle cx="90" cy="290" r="25" fill="url(#metal-dark)" />
//                         <circle cx="310" cy="290" r="25" fill="url(#metal-dark)" />
//                         <path d="M 90 290 Q 50 350 60 420" stroke="url(#metal-gradient)" stroke-width="24" stroke-linecap="round" fill="none" />
//                         <path d="M 310 290 Q 350 350 340 420" stroke="url(#metal-gradient)" stroke-width="24" stroke-linecap="round" fill="none" />
//                         <circle cx="60" cy="420" r="18" fill="#334155" />
//                         <circle cx="340" cy="420" r="18" fill="#334155" />
//                         <g id="robot-head-group" transform="translate(0, 0)">
//                             <line x1="200" y1="100" x2="200" y2="50" stroke="#94a3b8" stroke-width="4" />
//                             <circle cx="200" cy="45" r="6" fill="#ef4444" class="antenna-light" filter="url(#glow)" />
//                             <rect x="110" y="100" width="180" height="150" rx="40" fill="url(#metal-gradient)" stroke="#94a3b8" stroke-width="2" />
//                             <rect x="90" y="150" width="20" height="50" rx="5" fill="#475569" />
//                             <rect x="290" y="150" width="20" height="50" rx="5" fill="#475569" />
//                             <rect x="125" y="120" width="150" height="100" rx="25" fill="#0f172a" stroke="#1e293b" stroke-width="4" />
//                             <g id="eyes">
//                                 <g class="eye" transform="translate(160, 160)">
//                                     <rect x="-18" y="-18" width="36" height="36" rx="10" fill="#00ff9d" class="eye-shape" filter="url(#glow)" />
//                                     <rect x="-5" y="-5" width="10" height="10" rx="2" fill="#003d24" class="pupil" opacity="0.7" />
//                                 </g>
//                                 <g class="eye" transform="translate(240, 160)">
//                                     <rect x="-18" y="-18" width="36" height="36" rx="10" fill="#00ff9d" class="eye-shape" filter="url(#glow)" />
//                                     <rect x="-5" y="-5" width="10" height="10" rx="2" fill="#003d24" class="pupil" opacity="0.7" />
//                                 </g>
//                             </g>
//                             <rect x="125" y="120" width="150" height="100" rx="25" fill="url(#screen-shine)" pointer-events="none" />
//                             <path id="mouth" d="M 170 200 Q 200 210 230 200" stroke="#00ff9d" stroke-width="3" stroke-linecap="round" fill="none" filter="url(#glow)" opacity="0.8" />
//                         </g>
//                     </g>
//                 </svg>
//             </div>

//             <div class="login-section">
//                 <div class="login-wrapper">
//                     <div class="login-card">
//                         <div class="brand">
//                             <h1>VTab Square</h1>
//                             <p>Welcome back, Commander.</p>
//                         </div>
//                         <form id="login-form">
//                             <div class="input-group email-group">
//                                 <label for="login-email">Email</label>
//                                 <div class="input-wrapper" id="email-wrapper">
//                                     <svg id="mini-robot" viewBox="0 0 100 100" class="mini-robot">
//                                         <defs>
//                                             <linearGradient id="mini-metal" x1="0%" y1="0%" x2="100%" y2="100%">
//                                                 <stop offset="0%" style="stop-color:#cbd5e1;stop-opacity:1" />
//                                                 <stop offset="100%" style="stop-color:#94a3b8;stop-opacity:1" />
//                                             </linearGradient>
//                                         </defs>
//                                         <rect x="15" y="30" width="70" height="55" rx="15" fill="url(#mini-metal)" stroke="#475569" stroke-width="2" />
//                                         <rect x="20" y="45" width="60" height="20" rx="8" fill="#0f172a" />
//                                         <circle class="mini-eye left" cx="35" cy="55" r="6" fill="#00ff9d" />
//                                         <circle class="mini-eye right" cx="65" cy="55" r="6" fill="#00ff9d" />
//                                         <path d="M25 48 Q 30 48 35 50" stroke="rgba(255,255,255,0.3)" stroke-width="2" fill="none" />
//                                         <line x1="30" y1="30" x2="25" y2="10" stroke="#64748b" stroke-width="2" />
//                                         <line x1="70" y1="30" x2="75" y2="10" stroke="#64748b" stroke-width="2" />
//                                         <circle cx="25" cy="10" r="3" fill="#ef4444" />
//                                         <circle cx="75" cy="10" r="3" fill="#ef4444" />
//                                     </svg>
//                                     <svg class="mini-hands" viewBox="0 0 100 100">
//                                         <circle cx="15" cy="15" r="8" fill="#cbd5e1" stroke="#475569" stroke-width="2" />
//                                         <circle cx="85" cy="15" r="8" fill="#cbd5e1" stroke="#475569" stroke-width="2" />
//                                     </svg>
//                                     <input type="email" id="login-email" name="email" placeholder="name@vtab.com" required autocomplete="off">
//                                 </div>
//                             </div>
//                             <div class="input-group">
//                                 <label for="login-password">Password</label>
//                                 <div class="password-wrapper">
//                                     <input type="password" id="login-password" name="password" placeholder="••••••••" required>
//                                     <button type="button" class="icon-btn" id="toggle-password">
//                                         <svg class="eye-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
//                                             <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
//                                             <circle cx="12" cy="12" r="3"></circle>
//                                         </svg>
//                                         <svg class="eye-off-icon hidden" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
//                                             <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
//                                             <line x1="1" y1="1" x2="23" y2="23"></line>
//                                         </svg>
//                                     </button>
//                                 </div>
//                             </div>
//                             <button type="submit" class="login-btn" id="login-btn">
//                                 <span class="btn-text">Login</span>
//                                 <div class="loader hidden"></div>
//                             </button>
//                             <p class="forgot-pass"><a href="forgot_password.html">Forgot Password?</a></p>
//                             <p id="login-error" class="login-error" style="display:none;"></p>
//                         </form>
//                         <div class="footer">
//                             <p>Secure Access Terminal v2.0</p>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     `;
//     document.getElementById('app-content').innerHTML = content;

//     const form = document.getElementById('login-form');
//     const err = document.getElementById('login-error');
//     const loginBtn = document.getElementById('login-btn');
//     const btnText = loginBtn.querySelector('.btn-text');
//     const loader = loginBtn.querySelector('.loader');
//     const emailInput = document.getElementById('login-email');
//     const passwordInput = document.getElementById('login-password');
//     const robot = document.getElementById('robot');
//     const robotHead = document.getElementById('robot-head-group');
//     const eyes = document.querySelectorAll('.eye');
//     const pupils = document.querySelectorAll('.pupil');

//     // Robot Eye Tracking
//     document.addEventListener('mousemove', (e) => {
//         if (!robotHead) return;
//         const rekt = robot.getBoundingClientRect();
//         const robotHeadX = rekt.left + rekt.width * 0.5;
//         const robotHeadY = rekt.top + rekt.height * 0.3;
//         const mouseX = e.clientX;
//         const mouseY = e.clientY;
//         const angleDeg = angle(mouseX, mouseY, robotHeadX, robotHeadY);
//         const maxDist = 14;
//         const dist = Math.min(distance(mouseX, mouseY, robotHeadX, robotHeadY) / 25, maxDist);
//         const x = Math.cos(angleDeg * Math.PI / 180) * dist;
//         const y = Math.sin(angleDeg * Math.PI / 180) * dist;
//         pupils.forEach(pupil => pupil.setAttribute('transform', `translate(${x}, ${y})`));
//         const headX = Math.max(Math.min((mouseX - window.innerWidth / 2) / 60, 15), -15);
//         const headY = Math.max(Math.min((mouseY - window.innerHeight / 2) / 60, 10), -10);
//         robotHead.setAttribute('transform', `translate(${headX}, ${headY})`);
//     });

//     function angle(cx, cy, ex, ey) {
//         const dy = cy - ey;
//         const dx = cx - ex;
//         return Math.atan2(dy, dx) * 180 / Math.PI;
//     }

//     function distance(x1, y1, x2, y2) {
//         return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
//     }

//     // Blinking
//     function blink() {
//         if (robot.classList.contains('robot-error') || robot.classList.contains('robot-success')) return;
//         eyes.forEach(eye => eye.classList.add('blink'));
//         setTimeout(() => eyes.forEach(eye => eye.classList.remove('blink')), 150);
//         setTimeout(blink, Math.random() * 4000 + 2000);
//     }
//     setTimeout(blink, 3000);

//     // Mouse Spotlight & 3D Tilt
//     const loginCard = document.querySelector('.login-card');
//     document.addEventListener('mousemove', (e) => {
//         const x = e.clientX;
//         const y = e.clientY;
//         document.body.style.setProperty('--mouse-x', `${x}px`);
//         document.body.style.setProperty('--mouse-y', `${y}px`);
//         if (loginCard) {
//             const rect = loginCard.getBoundingClientRect();
//             const cardX = rect.left + rect.width / 2;
//             const cardY = rect.top + rect.height / 2;
//             const angleX = (y - cardY) / 25;
//             const angleY = (cardX - x) / 25;
//             loginCard.style.transform = `rotateX(${angleX}deg) rotateY(${angleY}deg)`;
//             loginCard.style.setProperty('--border-x', `${x - rect.left}px`);
//             loginCard.style.setProperty('--border-y', `${y - rect.top}px`);
//         }
//     });
//     document.addEventListener('mouseleave', () => {
//         if (loginCard) loginCard.style.transform = 'rotateX(0) rotateY(0)';
//     });

//     // Magnetic Button
//     loginBtn.addEventListener('mousemove', (e) => {
//         const rect = loginBtn.getBoundingClientRect();
//         const x = e.clientX - rect.left - rect.width / 2;
//         const y = e.clientY - rect.top - rect.height / 2;
//         const intensity = 0.08; // softer magnetic effect
//         loginBtn.style.transform = `translate(${x * intensity}px, ${y * intensity}px)`;
//     });
//     loginBtn.addEventListener('mouseleave', () => {
//         loginBtn.style.transform = 'translate(0, 0)';
//     });

//     // Mini Robot
//     const miniRobot = document.getElementById('mini-robot');
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     emailInput.addEventListener('input', (e) => {
//         if (emailRegex.test(e.target.value)) {
//             if (!miniRobot.classList.contains('bounce')) {
//                 miniRobot.classList.add('bounce');
//                 setTimeout(() => miniRobot.classList.remove('bounce'), 1000);
//             }
//         }
//     });

//     // Theme Toggle
//     const themeToggle = document.getElementById('theme-toggle');
//     const body = document.body;
//     if (localStorage.getItem('theme') === 'light') {
//         body.classList.add('light-mode');
//     }
//     themeToggle.addEventListener('click', () => {
//         body.classList.toggle('light-mode');
//         robot.classList.add('celebrate');
//         setTimeout(() => robot.classList.remove('celebrate'), 800);
//         localStorage.setItem('theme', body.classList.contains('light-mode') ? 'light' : 'dark');
//     });

//     // Mini Robot Peek
//     const miniEyes = document.querySelectorAll('.mini-eye');
//     const emailWrapper = document.getElementById('email-wrapper');
//     emailInput.addEventListener('focus', () => emailWrapper.classList.add('peek'));
//     emailInput.addEventListener('blur', () => emailWrapper.classList.remove('peek'));

//     // Robot Typing Effect
//     [emailInput, passwordInput].forEach(input => {
//         input.addEventListener('input', (e) => {
//             robot.classList.add('robot-typing');
//             clearTimeout(input.typingTimeout);
//             input.typingTimeout = setTimeout(() => robot.classList.remove('robot-typing'), 500);
//             if (input === emailInput) {
//                 const length = e.target.value.length;
//                 const progress = Math.min(length, 30) / 30;
//                 const currentOffset = -6 + (progress * 12);
//                 miniEyes.forEach(eye => {
//                     const baseCx = eye.classList.contains('left') ? 35 : 65;
//                     eye.setAttribute('cx', baseCx + currentOffset);
//                 });
//             }
//         });
//     });

//     passwordInput.addEventListener('focus', () => robot.classList.add('robot-smile'));
//     passwordInput.addEventListener('blur', () => robot.classList.remove('robot-smile'));

//     // Password Toggle
//     const toggleBtn = document.getElementById('toggle-password');
//     const eyeIcon = document.querySelector('.eye-icon');
//     const eyeOffIcon = document.querySelector('.eye-off-icon');
//     toggleBtn.addEventListener('click', () => {
//         const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
//         passwordInput.setAttribute('type', type);
//         if (type === 'text') {
//             eyeIcon.classList.add('hidden');
//             eyeOffIcon.classList.remove('hidden');
//         } else {
//             eyeIcon.classList.remove('hidden');
//             eyeOffIcon.classList.add('hidden');
//         }
//     });

//     // Login Logic (PRESERVED)
//     form.addEventListener('submit', async (e) => {
//         e.preventDefault();
//         err.style.display = 'none';
//         const email = emailInput.value.trim();
//         const password = passwordInput.value;

//         if (!email || !password) {
//             err.textContent = 'Email and password are required';
//             err.style.display = 'block';
//             handleError();
//             return;
//         }

//         loginBtn.disabled = true;
//         btnText.classList.add('hidden');
//         loader.classList.remove('hidden');

//         try {
//           const res = await fetch("http://localhost:5000/api/login", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ username: email, password }),
//           });
//           const data = await res.json();

//           // IF FIRST LOGIN → FORCE NEW PASSWORD
//           if (data.status === "first_login") {
//             sessionStorage.setItem("pendingUser", email);
//             window.location.href = "/create_new_password.html";
//             return;
//           }

//           // IF ACCOUNT LOCKED
//           if (data.status === "locked") {
//             loginBtn.disabled = false;
//             btnText.classList.remove("hidden");
//             loader.classList.add("hidden");
//             err.textContent = "Your account is locked. Contact admin.";
//             err.style.display = "block";
//             handleError();
//             return;
//           }

//           // NORMAL ERROR
//           if (!res.ok) {
//             loginBtn.disabled = false;
//             btnText.classList.remove("hidden");
//             loader.classList.add("hidden");
//             err.textContent = data.message || "Login failed";
//             err.style.display = "block";
//             handleError();
//             return;
//           }

//           // NORMAL SUCCESS (existing logic preserved)
//           handleSuccess();


//           const u = data.user || {};
//           const displayName = u.name || u.full_name || u.username || email;
//           const empId = u.employee_id || u.id || u.emp_id || u.email || email;
//           state.user = {
//             name: displayName,
//             initials:
//               String(displayName)
//                 .split(" ")
//                 .map((x) => x[0])
//                 .join("")
//                 .slice(0, 2)
//                 .toUpperCase() || "US",
//             id: empId,
//             email,
//             designation: u.designation || "",
//             is_admin: !!u.is_admin,
//           };
//           state.authenticated = true;
//           try {
//             localStorage.setItem(
//               "auth",
//               JSON.stringify({ authenticated: true, user: state.user })
//             );
//           } catch {}

//           try {
//             const all = await listEmployees(1, 5000);
//             const match = (all.items || []).find(
//               (e) => (e.email || "").toLowerCase() === email.toLowerCase()
//             );
//             if (match && match.employee_id) {
//               state.user.id = match.employee_id;
//               try {
//                 localStorage.setItem(
//                   "auth",
//                   JSON.stringify({ authenticated: true, user: state.user })
//                 );
//               } catch {}
//             }
//           } catch {}

//           startNotificationPolling();

//           setTimeout(() => {
//             const appContent = document.getElementById("app-content");
//             if (appContent) appContent.classList.add("page-exit-anim");
//             setTimeout(() => {
//               window.location.href = "/index.html#/";
//             }, 900);
//           }, 1000);
//         } catch (ex) {
//             loginBtn.disabled = false;
//             btnText.classList.remove('hidden');
//             loader.classList.add('hidden');
//             err.textContent = ex.message || 'Unexpected error';
//             err.style.display = 'block';
//             handleError();
//         }
//     });

//     function handleError() {
//         robot.classList.remove('robot-success');
//         robot.classList.add('robot-error');
//         robot.classList.add('shake');
//         setTimeout(() => robot.classList.remove('shake'), 500);
//         setTimeout(() => robot.classList.remove('robot-error'), 2000);
//     }

//     function handleSuccess() {
//         robot.classList.remove('robot-error');
//         robot.classList.add('robot-success');
//         btnText.textContent = 'Access Granted';
//         btnText.classList.remove('hidden');
//         loader.classList.add('hidden');
//     }
// };

import { state } from "../state.js";
import { listEmployees } from "../features/employeeApi.js";
import { startNotificationPolling } from "../features/notificationApi.js";

export const renderLoginPage = () => {
  const content = `
  <button id="theme-toggle" class="theme-toggle" aria-label="Toggle Theme">
    <svg class="toggle-icon sun-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="5"></circle>
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path>
    </svg>
    <svg class="toggle-icon moon-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
  </button>

  <div class="app-container split-layout">
    <div class="robot-section">
      <div class="celestial-wrapper">
        <svg class="celestial-body sun" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="30" fill="#FDB813" />
          <g stroke="#FDB813" stroke-width="4" stroke-linecap="round">
            <line x1="50" y1="10" x2="50" y2="5" />
            <line x1="50" y1="90" x2="50" y2="95" />
            <line x1="10" y1="50" x2="5" y2="50" />
            <line x1="90" y1="50" x2="95" y2="50" />
            <line x1="22" y1="22" x2="18" y2="18" />
            <line x1="78" y1="78" x2="82" y2="82" />
            <line x1="22" y1="78" x2="18" y2="82" />
            <line x1="78" y1="22" x2="82" y2="18" />
          </g>
        </svg>
        <svg class="celestial-body moon" viewBox="0 0 100 100">
          <path d="M50 15 A 35 35 0 1 0 85 50 A 28 28 0 1 1 50 15" fill="#F4F6F0" />
          <circle cx="30" cy="40" r="3" fill="#E0E0E0" opacity="0.5" />
          <circle cx="60" cy="70" r="5" fill="#E0E0E0" opacity="0.5" />
          <circle cx="45" cy="60" r="2" fill="#E0E0E0" opacity="0.5" />
        </svg>
      </div>

      <!-- Robot SVG (unchanged fun) -->
      <svg id="robot" viewBox="0 0 400 600" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="metal-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#e2e8f0" />
            <stop offset="50%" stop-color="#94a3b8" />
            <stop offset="100%" stop-color="#475569" />
          </linearGradient>
          <linearGradient id="metal-dark" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#475569" />
            <stop offset="100%" stop-color="#1e293b" />
          </linearGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="screen-shine" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="rgba(255,255,255,0.1)" />
            <stop offset="45%" stop-color="rgba(255,255,255,0)" />
            <stop offset="55%" stop-color="rgba(255,255,255,0)" />
            <stop offset="100%" stop-color="rgba(255,255,255,0.05)" />
          </linearGradient>
        </defs>
        <g id="robot-group">
          <rect x="180" y="230" width="40" height="40" fill="url(#metal-dark)" rx="5" />
          <path d="M 180 240 L 220 240" stroke="#334155" stroke-width="2" />
          <path d="M 180 250 L 220 250" stroke="#334155" stroke-width="2" />
          <path d="M 180 260 L 220 260" stroke="#334155" stroke-width="2" />
          <path d="M 100 270 Q 200 250 300 270 L 280 500 Q 200 520 120 500 Z" fill="url(#metal-gradient)" stroke="#334155" stroke-width="2" />
          <path d="M 140 300 L 260 300 L 250 420 L 150 420 Z" fill="#1e293b" stroke="#475569" stroke-width="2" />
          <circle cx="200" cy="360" r="25" fill="#1e1b4b" stroke="#312e81" stroke-width="2" />
          <circle cx="200" cy="360" r="15" fill="#6366f1" filter="url(#glow)" class="power-core" />
          <circle cx="90" cy="290" r="25" fill="url(#metal-dark)" />
          <circle cx="310" cy="290" r="25" fill="url(#metal-dark)" />
          <path d="M 90 290 Q 50 350 60 420" stroke="url(#metal-gradient)" stroke-width="24" stroke-linecap="round" fill="none" />
          <path d="M 310 290 Q 350 350 340 420" stroke="url(#metal-gradient)" stroke-width="24" stroke-linecap="round" fill="none" />
          <circle cx="60" cy="420" r="18" fill="#334155" />
          <circle cx="340" cy="420" r="18" fill="#334155" />
          <g id="robot-head-group" transform="translate(0, 0)">
            <line x1="200" y1="100" x2="200" y2="50" stroke="#94a3b8" stroke-width="4" />
            <circle cx="200" cy="45" r="6" fill="#ef4444" class="antenna-light" filter="url(#glow)" />
            <rect x="110" y="100" width="180" height="150" rx="40" fill="url(#metal-gradient)" stroke="#94a3b8" stroke-width="2" />
            <rect x="90" y="150" width="20" height="50" rx="5" fill="#475569" />
            <rect x="290" y="150" width="20" height="50" rx="5" fill="#475569" />
            <rect x="125" y="120" width="150" height="100" rx="25" fill="#0f172a" stroke="#1e293b" stroke-width="4" />
            <g id="eyes">
              <g class="eye" transform="translate(160, 160)">
                <rect x="-18" y="-18" width="36" height="36" rx="10" fill="#00ff9d" class="eye-shape" filter="url(#glow)" />
                <rect x="-5" y="-5" width="10" height="10" rx="2" fill="#003d24" class="pupil" opacity="0.7" />
              </g>
              <g class="eye" transform="translate(240, 160)">
                <rect x="-18" y="-18" width="36" height="36" rx="10" fill="#00ff9d" class="eye-shape" filter="url(#glow)" />
                <rect x="-5" y="-5" width="10" height="10" rx="2" fill="#003d24" class="pupil" opacity="0.7" />
              </g>
            </g>
            <rect x="125" y="120" width="150" height="100" rx="25" fill="url(#screen-shine)" pointer-events="none" />
            <path id="mouth" d="M 170 200 Q 200 210 230 200" stroke="#00ff9d" stroke-width="3" stroke-linecap="round" fill="none" filter="url(#glow)" opacity="0.8" />
          </g>
        </g>
      </svg>
    </div>

    <div class="login-section">
      <div class="login-wrapper">
        <div class="login-card">
          <div class="brand">
            <h1>VTab Square</h1>
            <p>Welcome back, Commander.</p>
          </div>

          <div class="form-tabs">
            <!-- Only Login tab visible initially -->
            <button class="tab active" data-tab="login-tab" id="tab-login">Login</button>
            <!-- First login tab exists but hidden until needed -->
            <button class="tab" data-tab="firstlogin-tab" id="tab-firstlogin" style="display:none">First Login</button>
          </div>

          <!-- LOGIN FORM -->
          <form id="login-form" class="active-tab" autocomplete="off">
            <div class="input-group email-group">
              <label for="login-email">Email</label>
              <div class="input-wrapper" id="email-wrapper">
                <svg id="mini-robot" viewBox="0 0 100 100" class="mini-robot">
                  <defs>
                    <linearGradient id="mini-metal" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style="stop-color:#cbd5e1;stop-opacity:1" />
                      <stop offset="100%" style="stop-color:#94a3b8;stop-opacity:1" />
                    </linearGradient>
                  </defs>
                  <rect x="15" y="30" width="70" height="55" rx="15" fill="url(#mini-metal)" stroke="#475569" stroke-width="2" />
                  <rect x="20" y="45" width="60" height="20" rx="8" fill="#0f172a" />
                  <circle class="mini-eye left" cx="35" cy="55" r="6" fill="#00ff9d" />
                  <circle class="mini-eye right" cx="65" cy="55" r="6" fill="#00ff9d" />
                  <path d="M25 48 Q 30 48 35 50" stroke="rgba(255,255,255,0.3)" stroke-width="2" fill="none" />
                  <line x1="30" y1="30" x2="25" y2="10" stroke="#64748b" stroke-width="2" />
                  <line x1="70" y1="30" x2="75" y2="10" stroke="#64748b" stroke-width="2" />
                  <circle cx="25" cy="10" r="3" fill="#ef4444" />
                  <circle cx="75" cy="10" r="3" fill="#ef4444" />
                </svg>

                <svg class="mini-hands" viewBox="0 0 100 100">
                  <circle cx="15" cy="15" r="8" fill="#cbd5e1" stroke="#475569" stroke-width="2" />
                  <circle cx="85" cy="15" r="8" fill="#cbd5e1" stroke="#475569" stroke-width="2" />
                </svg>

                <input type="email" id="login-email" name="email" placeholder="name@vtab.com" required autocomplete="off">
              </div>
            </div>

            <div class="input-group">
              <label for="login-password">Password</label>
              <div class="password-wrapper">
                <input type="password" id="login-password" name="password" placeholder="••••••••" required>
                <button type="button" class="icon-btn" id="toggle-password" aria-label="Toggle password visibility">
                  <svg class="eye-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  <svg class="eye-off-icon hidden" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                </button>
              </div>
            </div>

            <button type="submit" class="login-btn" id="login-btn">
              <span class="btn-text">Login</span>
              <div class="loader hidden"></div>
            </button>

            <p class="forgot-pass"><a href="forgot_password.html">Forgot Password?</a></p>
            <p id="login-error" class="login-error" style="display:none;"></p>
          </form>

          <!-- FIRST LOGIN FORM (simplified: only new password + confirm) -->
          <form id="firstlogin-form" class="hidden-tab" novalidate autocomplete="off">
            <!-- Hidden store for username provided by initial login attempt -->
            <input type="hidden" id="fl-username" name="fl-username" value="">

            <div id="fl-step2" style="margin-top:4px;">
              <div class="input-group">
                <label for="fl-new-password">New Password</label>
                <div class="input-wrapper">
                  <input type="password" id="fl-new-password" name="fl-new-password" placeholder="New password" disabled required>
                  <button type="button" class="icon-btn" id="toggle-fl-new"><svg class="eye-icon" width="20" height="20" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></button>
                </div>
                <p id="fl-strength" class="strength" style="font-size:12px;margin:6px 0 0 0;color:#ef4444;"></p>
              </div>

              <div class="input-group">
                <label for="fl-confirm-password">Confirm Password</label>
                <div class="input-wrapper">
                  <input type="password" id="fl-confirm-password" name="fl-confirm-password" placeholder="Confirm password" disabled required>
                  <button type="button" class="icon-btn" id="toggle-fl-confirm"><svg class="eye-icon" width="20" height="20" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></button>
                </div>
                <p id="fl-confirm-msg" style="font-size:12px;margin:6px 0 0 0;color:#ef4444;"></p>
              </div>

              <div style="display:flex;gap:10px;align-items:center;margin-top:8px;">
                <button type="button" id="fl-create-btn" class="login-btn small" disabled>Create New Password</button>
                <div id="fl-step2-msg" style="font-size:13px;color:#059669;"></div>
              </div>
            </div>

            <p style="margin-top:12px;font-size:13px;color:#6b7280;">This flow appears when your account is detected as first-login (default password).</p>
          </form>

          <div class="footer">
            <p>Secure Access Terminal v2.0</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <style>
    /* Minimal inline styles - keep your main CSS external if you have one */
    .split-layout { display:flex; gap:20px; align-items:stretch; padding:24px; }
    .robot-section { width:48%; display:flex; align-items:center; justify-content:center; position:relative; }
    .login-section { width:52%; display:flex; align-items:center; justify-content:center; }
    .login-card { width:100%; max-width:480px; padding:22px; border-radius:12px; background:#fff; box-shadow:0 10px 24px rgba(2,6,23,0.08); transition:height 260ms ease; overflow:visible; }
    .brand h1 { margin:0 0 4px 0; font-size:22px; }
    .input-group { margin-bottom:12px; }
    label { display:block; font-weight:600; margin-bottom:6px; color:#334155; }
    .input-wrapper { position:relative; }
    input[type="email"], input[type="password"], input[type="text"] { width:100%; padding:10px 12px; border-radius:8px; border:1px solid #e6e9ef; font-size:14px; }
    .password-wrapper { position:relative; display:flex; align-items:center; gap:8px; }
    .password-wrapper .icon-btn, .input-wrapper .icon-btn { position:absolute; right:6px; top:50%; transform:translateY(-50%); background:transparent; border:none; cursor:pointer; }
    .login-btn { margin-top:8px; padding:10px 14px; background:#6366f1; color:#fff; border:none; border-radius:8px; cursor:pointer; font-weight:700; }
    .login-btn.small { padding:8px 12px; font-size:14px; }
    .loader { width:18px; height:18px; border-radius:50%; border:3px solid rgba(255,255,255,0.4); border-top-color:white; animation:spin 0.8s linear infinite; display:inline-block; vertical-align:middle; }
    .hidden { display:none; }
    .hidden-tab { display:none; }
    .active-tab { display:block; }
    .form-tabs { display:flex; gap:8px; margin-bottom:12px; }
    .form-tabs .tab { padding:8px 12px; border-radius:8px; border:none; cursor:pointer; background:#f1f5f9; font-weight:600; }
    .form-tabs .tab.active { background:#6366f1; color:#fff; }
    .login-error { color:#ef4444; margin-top:8px; }
    .strength { font-size:12px; margin-top:4px; }
    @keyframes spin { from { transform:rotate(0deg);} to { transform:rotate(360deg);} }
    /* Forgot Password alignment fix */
    .forgot-pass {
        margin-top: 10px;
        text-align: center;
    }

    .forgot-pass a {
        font-size: 14px;
        text-decoration: none;
        color: #6366f1;
        font-weight: 500;
    }

    .forgot-pass a:hover {
        text-decoration: underline;
    }

  </style>
  `;

  document.getElementById("app-content").innerHTML = content;

  // ---------- DOM refs (kept your variable names) ----------
  const form = document.getElementById("login-form");
  const err = document.getElementById("login-error");
  const loginBtn = document.getElementById("login-btn");
  const btnText = loginBtn.querySelector(".btn-text");
  const loader = loginBtn.querySelector(".loader");
  const emailInput = document.getElementById("login-email");
  const passwordInput = document.getElementById("login-password");

  // first-login simplified refs
  const flForm = document.getElementById("firstlogin-form");
  const flUsername = document.getElementById("fl-username"); // hidden storage for username
  const flNewPw = document.getElementById("fl-new-password");
  const flConfirmPw = document.getElementById("fl-confirm-password");
  const flStrength = document.getElementById("fl-strength");
  const flConfirmMsg = document.getElementById("fl-confirm-msg");
  const flCreateBtn = document.getElementById("fl-create-btn");
  const flStep2Msg = document.getElementById("fl-step2-msg");

  // Robot & visuals
  const robot = document.getElementById("robot");
  const robotHead = document.getElementById("robot-head-group");
  const eyes = document.querySelectorAll(".eye");
  const pupils = document.querySelectorAll(".pupil");
  const miniRobot = document.getElementById("mini-robot");

  // Tabs
  const tabLogin = document.getElementById("tab-login");
  const tabFirst = document.getElementById("tab-firstlogin");

  // Theme toggle
  const themeToggle = document.getElementById("theme-toggle");
  const body = document.body;

  // helper functions
  function angle(cx, cy, ex, ey) {
    const dy = cy - ey;
    const dx = cx - ex;
    return (Math.atan2(dy, dx) * 180) / Math.PI;
  }
  function distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
  }

  // Keep animations & interactions intact (robot eye tracking)
  document.addEventListener("mousemove", (e) => {
    if (!robotHead) return;
    const rekt = robot.getBoundingClientRect();
    const robotHeadX = rekt.left + rekt.width * 0.5;
    const robotHeadY = rekt.top + rekt.height * 0.3;
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    const angleDeg = angle(mouseX, mouseY, robotHeadX, robotHeadY);
    const maxDist = 14;
    const dist = Math.min(
      distance(mouseX, mouseY, robotHeadX, robotHeadY) / 25,
      maxDist
    );
    const x = Math.cos((angleDeg * Math.PI) / 180) * dist;
    const y = Math.sin((angleDeg * Math.PI) / 180) * dist;
    pupils.forEach((pupil) =>
      pupil.setAttribute("transform", `translate(${x}, ${y})`)
    );
    const headX = Math.max(
      Math.min((mouseX - window.innerWidth / 2) / 60, 15),
      -15
    );
    const headY = Math.max(
      Math.min((mouseY - window.innerHeight / 2) / 60, 10),
      -10
    );
    robotHead.setAttribute("transform", `translate(${headX}, ${headY})`);
  });

  function blink() {
    if (
      robot.classList.contains("robot-error") ||
      robot.classList.contains("robot-success")
    )
      return;
    eyes.forEach((eye) => eye.classList.add("blink"));
    setTimeout(() => eyes.forEach((eye) => eye.classList.remove("blink")), 150);
    setTimeout(blink, Math.random() * 4000 + 2000);
  }
  setTimeout(blink, 3000);

  // mouse spotlight / card tilt
  const loginCard = document.querySelector(".login-card");
  document.addEventListener("mousemove", (e) => {
    const x = e.clientX;
    const y = e.clientY;
    document.body.style.setProperty("--mouse-x", `${x}px`);
    document.body.style.setProperty("--mouse-y", `${y}px`);
    if (loginCard) {
      const rect = loginCard.getBoundingClientRect();
      const cardX = rect.left + rect.width / 2;
      const cardY = rect.top + rect.height / 2;
      const angleX = (y - cardY) / 25;
      const angleY = (cardX - x) / 25;
      loginCard.style.transform = `rotateX(${angleX}deg) rotateY(${angleY}deg)`;
      loginCard.style.setProperty("--border-x", `${x - rect.left}px`);
      loginCard.style.setProperty("--border-y", `${y - rect.top}px`);
    }
  });
  document.addEventListener("mouseleave", () => {
    if (loginCard) loginCard.style.transform = "rotateX(0) rotateY(0)";
  });

  // mini robot bounce on valid email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  emailInput.addEventListener("input", (e) => {
    if (emailRegex.test(e.target.value)) {
      if (!miniRobot.classList.contains("bounce")) {
        miniRobot.classList.add("bounce");
        setTimeout(() => miniRobot.classList.remove("bounce"), 1000);
      }
    }
  });

  // theme toggle
  if (localStorage.getItem("theme") === "light")
    body.classList.add("light-mode");
  themeToggle.addEventListener("click", () => {
    body.classList.toggle("light-mode");
    robot.classList.add("celebrate");
    setTimeout(() => robot.classList.remove("celebrate"), 800);
    localStorage.setItem(
      "theme",
      body.classList.contains("light-mode") ? "light" : "dark"
    );
  });

  // mini robot peek on email focus
  const miniEyes = document.querySelectorAll(".mini-eye");
  const emailWrapper = document.getElementById("email-wrapper");
  emailInput.addEventListener("focus", () =>
    emailWrapper.classList.add("peek")
  );
  emailInput.addEventListener("blur", () =>
    emailWrapper.classList.remove("peek")
  );

  // typing animations preserved
  [emailInput, passwordInput].forEach((input) => {
    input.addEventListener("input", (e) => {
      robot.classList.add("robot-typing");
      clearTimeout(input.typingTimeout);
      input.typingTimeout = setTimeout(
        () => robot.classList.remove("robot-typing"),
        500
      );
      if (input === emailInput) {
        const length = e.target.value.length;
        const progress = Math.min(length, 30) / 30;
        const currentOffset = -6 + progress * 12;
        miniEyes.forEach((eye) => {
          const baseCx = eye.classList.contains("left") ? 35 : 65;
          eye.setAttribute("cx", baseCx + currentOffset);
        });
      }
    });
  });
  passwordInput.addEventListener("focus", () =>
    robot.classList.add("robot-smile")
  );
  passwordInput.addEventListener("blur", () =>
    robot.classList.remove("robot-smile")
  );

  // password toggle for login
  const toggleBtn = document.getElementById("toggle-password");
  const eyeIcon = document.querySelector(".eye-icon");
  const eyeOffIcon = document.querySelector(".eye-off-icon");
  toggleBtn.addEventListener("click", () => {
    const type =
      passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);
    if (type === "text") {
      eyeIcon.classList.add("hidden");
      eyeOffIcon.classList.remove("hidden");
    } else {
      eyeIcon.classList.remove("hidden");
      eyeOffIcon.classList.add("hidden");
    }
  });

  // password toggles in first-login form
  document.getElementById("toggle-fl-new").addEventListener("click", () => {
    const el = flNewPw;
    el.type = el.type === "password" ? "text" : "password";
  });
  document.getElementById("toggle-fl-confirm").addEventListener("click", () => {
    const el = flConfirmPw;
    el.type = el.type === "password" ? "text" : "password";
  });

  // TAB SWITCHING: login tab is visible by default; first-login tab hidden until first-login
  tabLogin.addEventListener("click", () => {
    tabLogin.classList.add("active");
    tabFirst.classList.remove("active");
    document.getElementById("login-form").classList.add("active-tab");
    document.getElementById("login-form").classList.remove("hidden-tab");
    document.getElementById("firstlogin-form").classList.remove("active-tab");
    document.getElementById("firstlogin-form").classList.add("hidden-tab");
  });

  tabFirst.addEventListener("click", () => {
    tabFirst.classList.add("active");
    tabLogin.classList.remove("active");
    document.getElementById("firstlogin-form").classList.add("active-tab");
    document.getElementById("firstlogin-form").classList.remove("hidden-tab");
    document.getElementById("login-form").classList.remove("active-tab");
    document.getElementById("login-form").classList.add("hidden-tab");
  });

  // Adjust card height helper to reduce "card blown up" issue
  function adjustCardHeight() {
    const card = document.querySelector(".login-card");
    if (!card) return;
    card.style.height = "auto";
    // small delay so layout settled
    setTimeout(() => {
      card.style.height = card.scrollHeight + "px";
    }, 50);
  }

  // ---------- LOGIN logic ----------
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    err.style.display = "none";
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      err.textContent = "Email and password are required";
      err.style.display = "block";
      handleError();
      return;
    }

    loginBtn.disabled = true;
    btnText.classList.add("hidden");
    loader.classList.remove("hidden");

    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password }),
      });
      const data = await res.json();

      // ===== FIRST LOGIN CASE =====
      // Backend returns { status: "first_login" } when stored hash is default.
      if (data && data.status === "first_login") {
        // Hide Login form and show First Login simplified form
        document.getElementById("login-form").classList.add("hidden-tab");

        // Show/enable the First Login tab and switch to it
        tabFirst.style.display = ""; // make tab visible
        tabFirst.click();

        // Store username and enable new password inputs
        flUsername.value = email;
        flNewPw.disabled = false;
        flConfirmPw.disabled = false;
        flCreateBtn.disabled = true; // will enable when strength+match ok
        flStep2Msg.textContent =
          "Please create a new password for your account.";
        flStep2Msg.style.color = "#059669";

        // reduce card size if it expanded
        adjustCardHeight();

        // reset login UI visuals
        loginBtn.disabled = false;
        btnText.classList.remove("hidden");
        loader.classList.add("hidden");

        return;
      }

      // ===== ACCOUNT LOCKED =====
      if (data && data.status === "locked") {
        loginBtn.disabled = false;
        btnText.classList.remove("hidden");
        loader.classList.add("hidden");
        err.textContent = "Your account is locked. Contact admin.";
        err.style.display = "block";
        handleError();
        return;
      }

      // ===== NORMAL ERROR =====
      if (!res.ok) {
        loginBtn.disabled = false;
        btnText.classList.remove("hidden");
        loader.classList.add("hidden");
        err.textContent = (data && data.message) || "Login failed";
        err.style.display = "block";
        handleError();
        return;
      }

      // ===== SUCCESS =====
      handleSuccess();

      const u = data.user || {};
      const displayName = u.name || u.full_name || u.username || email;
      const empId = u.employee_id || u.id || u.emp_id || u.email || email;
      state.user = {
        name: displayName,
        initials:
          String(displayName)
            .split(" ")
            .map((x) => x[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "US",
        id: empId,
        email,
        designation: u.designation || "",
        is_admin: !!u.is_admin,
      };
      state.authenticated = true;
      try {
        localStorage.setItem(
          "auth",
          JSON.stringify({ authenticated: true, user: state.user })
        );
      } catch {}

      try {
        const all = await listEmployees(1, 5000);
        const match = (all.items || []).find(
          (e) => (e.email || "").toLowerCase() === email.toLowerCase()
        );
        if (match && match.employee_id) {
          state.user.id = match.employee_id;
          try {
            localStorage.setItem(
              "auth",
              JSON.stringify({ authenticated: true, user: state.user })
            );
          } catch {}
        }
      } catch {}

      startNotificationPolling();

      setTimeout(() => {
        const appContent = document.getElementById("app-content");
        if (appContent) appContent.classList.add("page-exit-anim");
        setTimeout(() => {
          window.location.href = "/index.html#/";
        }, 900);
      }, 1000);
    } catch (ex) {
      loginBtn.disabled = false;
      btnText.classList.remove("hidden");
      loader.classList.add("hidden");
      err.textContent = ex.message || "Unexpected error";
      err.style.display = "block";
      handleError();
    }
  });

  // ---------- FIRST LOGIN: new password actions ----------
  function checkFlStrength() {
    const pw = flNewPw.value || "";
    const rules = [
      pw.length >= 8,
      /[A-Z]/.test(pw),
      /\d/.test(pw),
      /[@$!%*?&#]/.test(pw),
    ];
    if (rules.every(Boolean)) {
      flStrength.textContent = "Strong password ✔";
      flStrength.style.color = "#059669";
      return true;
    } else {
      flStrength.textContent =
        "Password must be ≥8 chars, include uppercase, number and special char";
      flStrength.style.color = "#ef4444";
      return false;
    }
  }

  function checkFlMatch() {
    const a = flNewPw.value || "";
    const b = flConfirmPw.value || "";
    if (!b) {
      flConfirmMsg.textContent = "";
      return false;
    }
    if (a === b) {
      flConfirmMsg.textContent = "Passwords match ✔";
      flConfirmMsg.style.color = "#059669";
      return true;
    } else {
      flConfirmMsg.textContent = "Passwords do not match";
      flConfirmMsg.style.color = "#ef4444";
      return false;
    }
  }

  flNewPw.addEventListener("input", () => {
    const good = checkFlStrength();
    const match = checkFlMatch();
    flCreateBtn.disabled = !(good && match);
  });

  flConfirmPw.addEventListener("input", () => {
    const match = checkFlMatch();
    const good = checkFlStrength();
    flCreateBtn.disabled = !(good && match);
  });

  // Create new password -> call reset-password with username + new_password
  flCreateBtn.addEventListener("click", async () => {
    flStep2Msg.textContent = "";
    flCreateBtn.disabled = true;
    flCreateBtn.textContent = "Updating...";

    const username = (flUsername.value || "").trim();
    const new_password = flNewPw.value || "";

    if (!username || !new_password) {
      flStep2Msg.style.color = "#ef4444";
      flStep2Msg.textContent = "Missing fields";
      flCreateBtn.disabled = false;
      flCreateBtn.textContent = "Create New Password";
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, new_password }),
      });
      const data = await res.json();

      if (res.ok && data.status === "success") {
        flStep2Msg.style.color = "#059669";
        flStep2Msg.textContent =
          "Password created successfully. Returning to login...";

        // Hide first-login UI, show login tab and prefill email
        tabFirst.style.display = "none"; // hide first-login tab again if you want only login visible initially
        tabLogin.click();
        emailInput.value = username;
        passwordInput.value = "";

        // reset fields & state
        flNewPw.value = "";
        flConfirmPw.value = "";
        flNewPw.disabled = true;
        flConfirmPw.disabled = true;
        flCreateBtn.disabled = true;
        flUsername.value = "";

        adjustCardHeight();

        // Try auto-login with new password (optional). If it works, proceed to app; otherwise instruct user.
        try {
          const loginResp = await fetch("http://localhost:5000/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password: new_password }),
          });
          const loginData = await loginResp.json();
          if (loginResp.ok && loginData.status === "success") {
            // successfully logged in - preserve existing login handling
            handleSuccess();
            const u = loginData.user || {};
            const displayName = u.name || u.full_name || u.username || username;
            const empId =
              u.employee_id || u.id || u.emp_id || u.email || username;
            state.user = {
              name: displayName,
              initials:
                String(displayName)
                  .split(" ")
                  .map((x) => x[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase() || "US",
              id: empId,
              email: username,
              designation: u.designation || "",
              is_admin: !!u.is_admin,
            };
            state.authenticated = true;
            try {
              localStorage.setItem(
                "auth",
                JSON.stringify({ authenticated: true, user: state.user })
              );
            } catch {}
            startNotificationPolling();
            setTimeout(() => {
              const appContent = document.getElementById("app-content");
              if (appContent) appContent.classList.add("page-exit-anim");
              setTimeout(() => {
                window.location.href = "/index.html#/";
              }, 900);
            }, 900);
            return;
          } else {
            // auto-login failed; inform user to use login tab
            flStep2Msg.style.color = "#059669";
            flStep2Msg.textContent =
              "Password updated. Please sign in using the Login tab.";
            // keep user on login tab (already switched)
          }
        } catch (ex) {
          flStep2Msg.style.color = "#059669";
          flStep2Msg.textContent =
            "Password updated. Please sign in using the Login tab.";
        }
      } else {
        flStep2Msg.style.color = "#ef4444";
        flStep2Msg.textContent =
          (data && data.message) || "Failed to update password";
      }
    } catch (ex) {
      flStep2Msg.style.color = "#ef4444";
      flStep2Msg.textContent = ex.message || "Unexpected error";
    } finally {
      flCreateBtn.disabled = false;
      flCreateBtn.textContent = "Create New Password";
    }
  });

  // ---------- small animation helpers ----------
  function handleError() {
    robot.classList.remove("robot-success");
    robot.classList.add("robot-error");
    robot.classList.add("shake");
    setTimeout(() => robot.classList.remove("shake"), 500);
    setTimeout(() => robot.classList.remove("robot-error"), 2000);
  }

  function handleSuccess() {
    robot.classList.remove("robot-error");
    robot.classList.add("robot-success");
    btnText.textContent = "Access Granted";
    btnText.classList.remove("hidden");
    loader.classList.add("hidden");
  }

  // allow external toggling if needed by other modules
  window.__markFirstLoginSimplified = (username) => {
    // This exposes a helper to programmatically open first-login simplified flow
    tabFirst.style.display = "";
    tabFirst.click();
    flUsername.value = username || "";
    flNewPw.disabled = false;
    flConfirmPw.disabled = false;
    flCreateBtn.disabled = true;
    adjustCardHeight();
  };

  // final adjust on load
  setTimeout(adjustCardHeight, 120);
};
