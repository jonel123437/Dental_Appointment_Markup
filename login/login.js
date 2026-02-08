let currentRole = 'student';

function selectRole(role, element) {
    currentRole = role;
    
    // Update active tab
    document.querySelectorAll('.role-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    element.classList.add('active');

    // Update input field based on role
    const userIdInput = document.getElementById('userId');
    const userIdLabel = document.getElementById('userIdLabel');
    const userIdIcon = document.getElementById('userIdIcon');
    
    if (role === 'admin') {
        userIdInput.placeholder = 'Enter your email address';
        userIdLabel.textContent = 'Email Address';
        userIdInput.type = 'email';
        userIdIcon.textContent = '📧';
    } else {
        userIdInput.placeholder = 'Enter your Student ID (e.g., STU-2024-001)';
        userIdLabel.textContent = 'Student ID';
        userIdInput.type = 'text';
        userIdIcon.textContent = '🆔';
    }
    
    // Clear the input
    userIdInput.value = '';
}

function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = event.target;
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.textContent = '🙈';
    } else {
        passwordInput.type = 'password';
        toggleBtn.textContent = '👁️';
    }
}

function handleLogin(event) {
    event.preventDefault();
    
    const userId = document.getElementById('userId').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    console.log('Login attempt:', {
        role: currentRole,
        userId: userId,
        password: password,
        rememberMe: rememberMe
    });

    // MARKUP DESIGN - Accept any login credentials
    if (currentRole === 'student') {
        alert('Login successful!\n\nRole: Student\nRedirecting to student dashboard...');
        window.location.href = '../student/index.html';
    } else {
        alert('Login successful!\n\nRole: Admin\nRedirecting to admin dashboard...');
        window.location.href = '../admin/admin-dashboard.html';
    }

    // In real PHP app, uncomment this:
    /*
    fetch('login.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            role: currentRole,
            user_id: userId,
            password: password,
            remember_me: rememberMe
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            if (data.role === 'student') {
                window.location.href = 'student-dashboard.php';
            } else if (data.role === 'admin') {
                window.location.href = 'admin-dashboard.php';
            }
        } else {
            alert('Login failed: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    });
    */
}