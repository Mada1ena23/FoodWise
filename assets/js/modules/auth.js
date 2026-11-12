(function () {
  const USERS_KEY = 'foodwise_users';
  const SESSION_KEY = 'foodwise_session';

  function getUsers() {
    const rawUsers = localStorage.getItem(USERS_KEY);
    return rawUsers ? JSON.parse(rawUsers) : [];
  }

  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  function getCurrentUser() {
    const rawUser = sessionStorage.getItem(SESSION_KEY);
    return rawUser ? JSON.parse(rawUser) : null;
  }

  function setCurrentUser(user) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
  }

  function clearCurrentUser() {
    sessionStorage.removeItem(SESSION_KEY);
  }

  function showMessage(element, message, type) {
    if (!element) return;
    element.textContent = message;
    element.className = `form-message ${type}`;
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function redirectToDashboard() {
    window.location.href = 'dashboard.html';
  }

  function handleLogin(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const email = form.email.value.trim();
    const password = form.password.value.trim();
    const message = form.querySelector('.form-message');

    if (!email || !password) {
      showMessage(message, 'Preenche o e-mail e a palavra-passe.', 'error');
      return;
    }

    const users = getUsers();
    const user = users.find((item) => item.email.toLowerCase() === email.toLowerCase() && item.password === password);

    if (!user) {
      showMessage(message, 'E-mail ou palavra-passe incorretos.', 'error');
      return;
    }

    const safeUser = { id: user.id, name: user.name, email: user.email };
    setCurrentUser(safeUser);
    showMessage(message, 'Sessão iniciada com sucesso! A redirecionar...', 'success');
    setTimeout(redirectToDashboard, 600);
  }

  function handleRegister(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value.trim();
    const passwordConfirm = form.passwordConfirm.value.trim();
    const message = form.querySelector('.form-message');

    if (!name || !email || !password || !passwordConfirm) {
      showMessage(message, 'Preenche todos os campos.', 'error');
      return;
    }

    if (!isValidEmail(email)) {
      showMessage(message, 'Introduz um e-mail válido.', 'error');
      return;
    }

    if (password.length < 6) {
      showMessage(message, 'A palavra-passe deve ter pelo menos 6 caracteres.', 'error');
      return;
    }

    if (password !== passwordConfirm) {
      showMessage(message, 'As palavras-passe não coincidem.', 'error');
      return;
    }

    const users = getUsers();
    const emailExists = users.some((user) => user.email.toLowerCase() === email.toLowerCase());

    if (emailExists) {
      showMessage(message, 'Já existe uma conta com este e-mail.', 'error');
      return;
    }

    const newUser = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      name,
      email: email.toLowerCase(),
      password
    };

    users.push(newUser);
    saveUsers(users);

    setCurrentUser({ id: newUser.id, name: newUser.name, email: newUser.email });
    showMessage(message, 'Conta criada com sucesso! A redirecionar...', 'success');
    setTimeout(redirectToDashboard, 600);
  }

  function handleLogout(event) {
    event.preventDefault();
    clearCurrentUser();
    window.location.href = 'login.html';
  }

  document.addEventListener('DOMContentLoaded', () => {
    const page = document.body.dataset.page;
    const currentUser = getCurrentUser();

    if (page === 'login' && currentUser) {
      redirectToDashboard();
      return;
    }

    if (page === 'register' && currentUser) {
      redirectToDashboard();
      return;
    }

    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const logoutButton = document.getElementById('logoutButton');
    const userNameDisplay = document.getElementById('userNameDisplay');

    if (loginForm) {
      loginForm.addEventListener('submit', handleLogin);
    }

    if (registerForm) {
      registerForm.addEventListener('submit', handleRegister);
    }

    if (logoutButton) {
      logoutButton.addEventListener('click', handleLogout);
    }

    if (page === 'dashboard' && currentUser) {
      userNameDisplay.textContent = currentUser.name;
    } else if (page === 'dashboard') {
      window.location.href = 'login.html';
    }
  });
})();
