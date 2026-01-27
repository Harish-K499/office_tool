import { renderLoginPage } from './pages/login.js';

// Render only the login page (no layout/sidebar/header)
window.addEventListener('load', () => {
  renderLoginPage();
});
