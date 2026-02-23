// ─── Tab Switching ───
function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.getElementById('login-form').classList.toggle('hidden', tab !== 'login');
  document.getElementById('register-form').classList.toggle('hidden', tab !== 'register');
  const wrapper = document.querySelector('.form-wrapper');
  wrapper.style.animation = 'none';
  wrapper.offsetHeight;
  wrapper.style.animation = '';
  clearErrors();
}

// ─── Role Selector ───
let currentRole = 'student';
function selectRole(btn) {
  document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  currentRole = btn.dataset.role;
  document.getElementById('student-login-fields').classList.toggle('hidden', currentRole !== 'student');
  document.getElementById('admin-login-fields').classList.toggle('hidden', currentRole !== 'admin');
  document.getElementById('login-btn').textContent = currentRole === 'admin' ? 'Sign In as Admin' : 'Sign In';
}

// ─── Password Toggle ───
function togglePw(btn) {
  const input = btn.previousElementSibling;
  const isPassword = input.type === 'password';
  input.type = isPassword ? 'text' : 'password';
  btn.querySelector('.eye-open').classList.toggle('hidden', isPassword);
  btn.querySelector('.eye-closed').classList.toggle('hidden', !isPassword);
}

// ─── Errors ───
function clearErrors() {
  document.querySelectorAll('.error-msg').forEach(e => e.classList.remove('show'));
  document.querySelectorAll('input').forEach(i => i.classList.remove('input-error'));
}
function showError(inputId, errorId) {
  document.getElementById(inputId).classList.add('input-error');
  document.getElementById(errorId).classList.add('show');
}

// ─── Login (accepts any input) ───
function handleLogin(e) {
  e.preventDefault();
  clearErrors();

  if (currentRole === 'student') {
    const sid = document.getElementById('login-sid').value.trim();
    const pw  = document.getElementById('login-pw').value;

    if (!sid || !pw) {
      document.getElementById('login-sid').classList.add('input-error');
      document.getElementById('login-pw').classList.add('input-error');
      showSuccess('Login Failed', 'Please enter your Student ID and password.');
      return;
    }

    const students = JSON.parse(localStorage.getItem('students') || '[]');
    const student  = students.find(s => s.sid === sid && s.pw === pw);

    if (!student) {
      document.getElementById('login-sid').classList.add('input-error');
      document.getElementById('login-pw').classList.add('input-error');
      showSuccess('Login Failed', 'Invalid Student ID or password. Please try again.');
      return;
    }

    localStorage.setItem('loggedInStudent', JSON.stringify(student));
    showSuccess('Welcome back!', `Signed in as ${student.fname} ${student.lname}. Redirecting…`);
    setTimeout(() => {
      window.location.href = '../student/student.html';
    }, 1500);
  } else {
    const email = document.getElementById('login-email').value.trim();
    showSuccess('Admin Access', `Signed in as Admin${email ? ' (' + email + ')' : ''}. Redirecting…`);
    setTimeout(() => {
      window.location.href = '../admin/admin.html';
    }, 1500);
  }
}

// ─── Register (validates, then accepts) ───
function handleRegister(e) {
  e.preventDefault();
  clearErrors();
  let valid = true;
  const fname = document.getElementById('reg-fname').value.trim();
  const lname = document.getElementById('reg-lname').value.trim();
  const sid   = document.getElementById('reg-sid').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const pw    = document.getElementById('reg-pw').value;
  const cpw   = document.getElementById('reg-cpw').value;

  if (!fname) { showError('reg-fname','err-fname'); valid = false; }
  if (!lname) { showError('reg-lname','err-lname'); valid = false; }
  if (!sid)   { showError('reg-sid','err-sid');     valid = false; }
  if (!email || !email.includes('@')) { showError('reg-email','err-email'); valid = false; }
  if (pw.length < 6) { showError('reg-pw','err-pw'); valid = false; }
  if (pw !== cpw) { showError('reg-cpw','err-cpw'); valid = false; }
  if (!valid) return;

  const students = JSON.parse(localStorage.getItem('students') || '[]');
  const sidTaken   = students.find(s => s.sid === sid);
  const emailTaken = students.find(s => s.email === email);

  if (sidTaken) {
    showError('reg-sid', 'err-sid');
    document.getElementById('err-sid').textContent = 'Student ID already registered';
    return;
  }
  if (emailTaken) {
    showError('reg-email', 'err-email');
    document.getElementById('err-email').textContent = 'Email already registered';
    return;
  }

  students.push({ fname, lname, sid, email, pw, credits: 3 });
  localStorage.setItem('students', JSON.stringify(students));

  showSuccess(
    'Account Created!',
    `Welcome, ${fname} ${lname}! Your account has been registered. You start with 3/3 appointment credits.`
  );

  setTimeout(() => {
    closeSuccess();
    switchTab('login');
  }, 2000);
}

// ─── Success Modal ───
function showSuccess(title, msg) {
  document.getElementById('success-title').textContent = title;
  document.getElementById('success-msg').textContent = msg;
  document.getElementById('success-overlay').classList.add('show');
}
function closeSuccess() {
  document.getElementById('success-overlay').classList.remove('show');
}
document.getElementById('success-overlay').addEventListener('click', function(e) {
  if (e.target === this) closeSuccess();
});