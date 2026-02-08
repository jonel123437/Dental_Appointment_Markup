// Toggle user dropdown
function toggleDropdown() {
    const dropdown = document.getElementById('userDropdown');
    dropdown.classList.toggle('active');
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const userMenu = document.querySelector('.user-menu');
    const dropdown = document.getElementById('userDropdown');
    
    if (userMenu && !userMenu.contains(event.target)) {
        dropdown.classList.remove('active');
    }
});

// Toggle mobile menu
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    const burgerMenu = document.querySelector('.burger-menu');
    
    mobileMenu.classList.toggle('active');
    burgerMenu.classList.toggle('active');
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        window.location.href = '../login/login.html';
    }
}

// View appointment slip
function viewSlip() {
    window.location.href = '../appointment-slip/appointment-slip.html';
}

// Cancel appointment
function cancelAppointment() {
    if (confirm('Are you sure you want to cancel this appointment? This action cannot be undone.')) {
        alert('Appointment cancelled successfully!');
        // In real app: make AJAX call to cancel appointment
    }
}

// Simple countdown calculator
function updateCountdown() {
    const appointmentDate = new Date('2026-02-15');
    const today = new Date();
    const diffTime = appointmentDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const countdownValue = document.querySelector('.countdown-value');
    if (countdownValue && diffDays > 0) {
        countdownValue.textContent = diffDays + ' Days';
    }
}

function bookAppointment() {
    window.location.href = '../book-appointment/book-appointment.html'
}

function goToNotifications() {
  window.location.href = '../notification/notifications.html';
}


// Call on page load
updateCountdown();