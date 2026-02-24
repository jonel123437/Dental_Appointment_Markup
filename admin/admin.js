// ─── Load Admin Session ───
const loggedInAdmin = JSON.parse(localStorage.getItem('loggedInAdmin') || 'null');
if (!loggedInAdmin) {
  window.location.href = '../login/login.html';
} else {
  document.getElementById('admin-name').textContent = loggedInAdmin.name;
  document.getElementById('admin-email').textContent = loggedInAdmin.email;

  // Generate initials from name
  const initials = loggedInAdmin.name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  document.getElementById('admin-avatar').textContent = initials;
}

// ─── Sidebar ───
function toggleSidebar(){
  document.getElementById('sidebar').classList.toggle('open');
  document.querySelector('.sidebar-overlay').classList.toggle('show');
}
function activateNav(btn){
  document.querySelectorAll('.nav-item').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('sidebar').classList.remove('open');
  document.querySelector('.sidebar-overlay').classList.remove('show');
}

// ─── Tab Switching ───
function switchTab(index){
  document.querySelectorAll('.tab-btn').forEach((b,i)=>b.classList.toggle('active',i===index));
  document.querySelectorAll('.tab-content').forEach((c,i)=>c.classList.toggle('active',i===index));
}

// ─── Modals ───
function openModal(id){ document.getElementById(id).classList.add('show') }
function closeModal(id){ document.getElementById(id).classList.remove('show') }
document.querySelectorAll('.modal-overlay').forEach(o=>{
  o.addEventListener('click',function(e){ if(e.target===this) this.classList.remove('show') });
});

// ─── Edit Credits ───
let currentCredits = 2;
function openEditModal(name, sid, credits){
  document.getElementById('edit-name').textContent = name;
  document.getElementById('edit-sid').textContent = sid;
  currentCredits = credits;
  document.getElementById('credit-val').textContent = currentCredits;
  openModal('edit-modal');
}
function adjustCredit(delta){
  currentCredits = Math.max(0, Math.min(3, currentCredits + delta));
  document.getElementById('credit-val').textContent = currentCredits;
}

// ─── Toast ───
function showToast(){
  const t = document.getElementById('toast');
  t.style.opacity='1';
  t.style.transform='translateX(-50%) translateY(0)';
  t.style.pointerEvents='auto';
  setTimeout(()=>{
    t.style.opacity='0';
    t.style.transform='translateX(-50%) translateY(80px)';
    t.style.pointerEvents='none';
  },2500);
}

function getTodayStr(){
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
}

function updateBadges(count){
  document.querySelector('.stat-card:nth-child(1) .stat-value').textContent = count;
  document.querySelectorAll('.tab-btn')[0].querySelector('.tab-count').textContent = count;
  document.querySelectorAll('.nav-badge')[0].textContent = count;
}

// ─── Store all appointments for filtering ───
let allTodaysAppointments = [];

let pickerMonth = new Date().getMonth();
let pickerYear = new Date().getFullYear();
let selectedPickerDate = getTodayStr();
let currentPurpose = ''; 
const PICKER_MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function loadTodaysAppointments() {
  const students = JSON.parse(localStorage.getItem('students') || '[]');
  allTodaysAppointments = [];

  students.forEach(student => {
    const appointments = JSON.parse(localStorage.getItem(`appointments_${student.sid}`) || '[]');
    appointments.forEach(appt => {
      allTodaysAppointments.push({ student, appt });
    });
  });

  allTodaysAppointments.sort((a, b) => {
    if (a.appt.date !== b.appt.date) return a.appt.date.localeCompare(b.appt.date);
    return a.appt.time.localeCompare(b.appt.time);
  });

  filterAppointments();
}

function filterAppointments() {
  const search = document.getElementById('appt-search').value.toLowerCase();
  const dateFilter = selectedPickerDate;
  const purposeFilter = currentPurpose;
  const tbody = document.querySelector('#tab-0 tbody');

  const filtered = allTodaysAppointments.filter(({ student, appt }) => {
    const fullName = `${student.fname} ${student.lname}`.toLowerCase();
    const sid = student.sid.toLowerCase();
    const matchSearch = !search || fullName.includes(search) || sid.includes(search);
    const matchDate = !dateFilter || appt.date === dateFilter;
    const matchPurpose = !purposeFilter || appt.purpose === purposeFilter;
    return matchSearch && matchDate && matchPurpose;
  });

  tbody.innerHTML = '';

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center;padding:32px;color:var(--text-muted);font-style:italic">
          No appointments found.
        </td>
      </tr>`;
    updateBadges(0);
    return;
  }

  filtered.forEach(({ student, appt }, i) => {
    const initials = (student.fname[0] + student.lname[0]).toUpperCase();
    const fullName = `${student.fname} ${student.lname}`;
    const credits = student.credits ?? 3;
    const dateLabel = new Date(appt.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    tbody.innerHTML += `
      <tr>
        <td data-label="No." style="font-weight:700;color:var(--text-muted)">${i + 1}</td>
        <td data-label="Student">
          <div class="student-cell">
            <div class="student-avatar">${initials}</div>
            <div>
              <div class="student-name">${fullName}</div>
              <div class="student-id">${student.sid}</div>
            </div>
          </div>
        </td>
        <td data-label="Date"><strong>${dateLabel}</strong></td>
        <td data-label="Time"><span class="time-badge">${appt.time}</span></td>
        <td data-label="Purpose">${appt.purpose}</td>
      </tr>`;
  });

  updateBadges(filtered.length);
}

loadTodaysAppointments();
document.getElementById('cal-btn-label').textContent = 'Today';

function toggleCalendarPicker(event){
  event.stopPropagation();
  document.getElementById('purpose-dropdown').classList.remove('show');
  const picker = document.getElementById('appt-cal-picker');
  const isOpen = picker.classList.contains('show');
  if(isOpen){ picker.classList.remove('show'); return; }
  picker.classList.add('show');
  renderPickerCalendar();
}

function pickerPrevMonth(){
  pickerMonth--;
  if(pickerMonth < 0){ pickerMonth = 11; pickerYear--; }
  renderPickerCalendar();
}

function pickerNextMonth(){
  pickerMonth++;
  if(pickerMonth > 11){ pickerMonth = 0; pickerYear++; }
  renderPickerCalendar();
}

function renderPickerCalendar(){
  document.getElementById('picker-month-label').textContent = `${PICKER_MONTHS[pickerMonth]} ${pickerYear}`;

  const firstDay = new Date(pickerYear, pickerMonth, 1).getDay();
  const daysInMonth = new Date(pickerYear, pickerMonth + 1, 0).getDate();
  const todayStr = getTodayStr();

  // Get dates that have appointments
  const apptDates = new Set(allTodaysAppointments.map(x => x.appt.date));

  const body = document.getElementById('picker-cal-body');
  body.innerHTML = '';

  // Filler cells
  for(let i = 0; i < firstDay; i++){
    const cell = document.createElement('div');
    body.appendChild(cell);
  }

  for(let day = 1; day <= daysInMonth; day++){
    const dateStr = `${pickerYear}-${String(pickerMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    const hasAppt = apptDates.has(dateStr);
    const isToday = dateStr === todayStr;
    const isSelected = dateStr === selectedPickerDate;

    const cell = document.createElement('div');
    cell.textContent = day;
    cell.style.cssText = `
      padding:6px 2px;border-radius:8px;font-size:.82rem;font-weight:${hasAppt ? '700' : '400'};
      cursor:pointer;
      color:${isSelected ? '#fff' : isToday ? 'var(--primary)' : hasAppt ? 'var(--text)' : 'var(--text-muted)'};
      background:${isSelected ? 'var(--primary)' : 'transparent'};
      opacity:1;
      position:relative;
    `;

    cell.onclick = () => selectPickerDate(dateStr);

    if(hasAppt){
      cell.innerHTML = `
        ${day}
        <span style="position:absolute;bottom:1px;left:50%;transform:translateX(-50%);width:4px;height:4px;border-radius:50%;background:${isSelected ? '#fff' : 'var(--primary)'}"></span>
      `;
    }

    body.appendChild(cell);
  }
}

function selectPickerDate(dateStr){
  selectedPickerDate = dateStr;
  renderPickerCalendar();

  // Update button label
  const label = new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  document.getElementById('cal-btn-label').textContent = dateStr === getTodayStr() ? 'Today' : label;

  // Apply filter
  document.getElementById('appt-cal-picker').classList.remove('show');
  filterAppointments();
}

function clearDateFilter(){
  selectedPickerDate = '';
  document.getElementById('cal-btn-label').textContent = 'All Dates';
  document.getElementById('appt-cal-picker').classList.remove('show');
  filterAppointments();
}

function setTodayFilter(){
  selectedPickerDate = getTodayStr();
  pickerMonth = new Date().getMonth();
  pickerYear = new Date().getFullYear();
  document.getElementById('cal-btn-label').textContent = 'Today';
  document.getElementById('appt-cal-picker').classList.remove('show');
  filterAppointments();
}


function togglePurposeDropdown(event){
  event.stopPropagation();
  document.getElementById('appt-cal-picker').classList.remove('show');
  const dropdown = document.getElementById('purpose-dropdown');
  dropdown.classList.toggle('show');
}

function selectPurpose(value, label){
  currentPurpose = value;
  document.getElementById('purpose-btn-label').textContent = label;
  document.getElementById('purpose-dropdown').classList.remove('show');
  document.querySelectorAll('.purpose-option').forEach(btn => {
    btn.classList.toggle('active', btn.textContent.trim() === label);
  });
  filterAppointments();
}

// Close dropdowns when clicking outside
document.addEventListener('click', function(e){
  const calPicker = document.getElementById('appt-cal-picker');
  const calBtn = document.getElementById('cal-toggle-btn');
  if(calPicker && !calPicker.contains(e.target) && !calBtn.contains(e.target)){
    calPicker.classList.remove('show');
  }

  const purposeDropdown = document.getElementById('purpose-dropdown');
  const purposeBtn = document.getElementById('purpose-toggle-btn');
  if(purposeDropdown && purposeBtn && !purposeDropdown.contains(e.target) && !purposeBtn.contains(e.target)){
    purposeDropdown.classList.remove('show');
  }
});

// ─── Student Management ───
function loadStudents() {
  const students = JSON.parse(localStorage.getItem('students') || '[]');
  const tbody = document.querySelector('#tab-2 tbody');
  tbody.innerHTML = '';

  // Update student count badges
  document.querySelector('.stat-card:nth-child(3) .stat-value').textContent = students.length;
  document.querySelectorAll('.tab-btn')[2].querySelector('.tab-count').textContent = students.length;
  document.querySelectorAll('.nav-badge')[2].textContent = students.length;

  if (students.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center;padding:32px;color:var(--text-muted);font-style:italic">
          No students found.
        </td>
      </tr>`;
    return;
  }

  students.forEach((student, i) => {
    const credits = student.credits ?? 3;
    const initials = (student.fname[0] + student.lname[0]).toUpperCase();
    const fullName = `${student.fname} ${student.lname}`;

    const appointments = JSON.parse(localStorage.getItem(`appointments_${student.sid}`) || '[]');
    const totalAppts = appointments.length;

    let dots = '';
    for (let j = 0; j < 3; j++) {
      dots += `<span class="dot ${j < credits ? 'filled' : 'empty'}"></span>`;
    }

    tbody.innerHTML += `
      <tr>
        <td data-label="No." style="font-weight:700;color:var(--text-muted)">${i + 1}</td>
        <td data-label="Student">
          <div class="student-cell">
            <div class="student-avatar">${initials}</div>
            <div>
              <div class="student-name">${fullName}</div>
              <div class="student-id">${student.sid}</div>
            </div>
          </div>
        </td>
        <td data-label="Email" style="color:var(--text-muted)">${student.email ?? '—'}</td>
        <td data-label="Credits">
          <div class="credits-display">
            ${dots}
            ${credits}/3
          </div>
        </td>
        <td data-label="Appointments" style="text-align:center">
          <button class="action-btn" onclick="openStudentApptsModal('${student.sid}', '${fullName}')" style="font-weight:700">${totalAppts}</button>
        </td>
        <td data-label="Actions"><button class="action-btn edit" onclick="openEditModal('${fullName}','${student.sid}',${credits})">✏️ Edit</button></td>
      </tr>`;
  });
}

loadStudents();

function saveCredits() {
  const sid = document.getElementById('edit-sid').textContent;
  const students = JSON.parse(localStorage.getItem('students') || '[]');
  const student = students.find(s => s.sid === sid);
  if (student) {
    student.credits = currentCredits;
    localStorage.setItem('students', JSON.stringify(students));

    // ← ADD THIS: update loggedInStudent session if it's the same student
    const loggedIn = JSON.parse(localStorage.getItem('loggedInStudent') || 'null');
    if (loggedIn && loggedIn.sid === sid) {
      loggedIn.credits = currentCredits;
      localStorage.setItem('loggedInStudent', JSON.stringify(loggedIn));
    }
  }
  closeModal('edit-modal');
  showToast();
  loadStudents();
  loadTodaysAppointments();
}

// ─── Post-Appointment Feedback ───
let currentFeedbackData = null;

function loadFeedback() {
  const students = JSON.parse(localStorage.getItem('students') || '[]');
  const tbody = document.querySelector('#tab-1 tbody');
  tbody.innerHTML = '';

  const allFeedback = [];

  students.forEach(student => {
    const appointments = JSON.parse(localStorage.getItem(`appointments_${student.sid}`) || '[]');
    appointments.forEach(appt => {
      if (appt.response) {
        allFeedback.push({ student, appt });
      }
    });
  });

  // Sort newest first
  allFeedback.sort((a, b) => new Date(b.appt.date) - new Date(a.appt.date));

  // Update Pending Feedback stat card (appointments with no response yet, in the past)
  const today = new Date(); today.setHours(0,0,0,0);
  let pendingCount = 0;
  students.forEach(student => {
    const appointments = JSON.parse(localStorage.getItem(`appointments_${student.sid}`) || '[]');
    appointments.forEach(appt => {
      if (!appt.response && new Date(appt.date) < today) pendingCount++;
    });
  });
  document.querySelector('.stat-card:nth-child(2) .stat-value').textContent = pendingCount;

  // Update tab count
  document.querySelectorAll('.tab-btn')[1].querySelector('.tab-count').textContent = allFeedback.length;
  document.querySelectorAll('.nav-badge')[1].textContent = allFeedback.length;

  if (allFeedback.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center;padding:32px;color:var(--text-muted);font-style:italic">
          No feedback yet.
        </td>
      </tr>`;
    return;
  }

  allFeedback.forEach(({ student, appt }, i) => {
    const initials = (student.fname[0] + student.lname[0]).toUpperCase();
    const fullName = `${student.fname} ${student.lname}`;
    const apptDate = new Date(appt.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const respDate = new Date(appt.date + 'T00:00:00');
    respDate.setDate(respDate.getDate() + 1);
    const responseDateLabel = respDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    let badgeClass, badgeLabel;
    if (appt.response === 'yes')       { badgeClass = 'yes';  badgeLabel = '✅ Yes'; }
    else if (appt.response === 'no')   { badgeClass = 'no';   badgeLabel = '❌ No'; }
    else if (appt.response === 'auto-yes') { badgeClass = 'auto'; badgeLabel = '✅ Auto-Yes'; }

    tbody.innerHTML += `
      <tr>
        <td data-label="No." style="font-weight:700;color:var(--text-muted)">${i + 1}</td>
        <td data-label="Student">
          <div class="student-cell">
            <div class="student-avatar">${initials}</div>
            <div>
              <div class="student-name">${fullName}</div>
              <div class="student-id">${student.sid}</div>
            </div>
          </div>
        </td>
        <td data-label="Date"><strong>${apptDate}</strong></td>
        <td data-label="Time"><span class="time-badge">${appt.time}</span></td>
        <td data-label="Response"><span class="badge ${badgeClass}">${badgeLabel}</span></td>
        <td data-label="Resp. Date">${responseDateLabel}</td>
        <td data-label="Actions"><button class="action-btn" onclick="openFeedbackModal(${i})">👁️ View</button></td>
      </tr>`;
  });

  // Store for modal access
  window._allFeedback = allFeedback;
}

function openFeedbackModal(index) {
  const { student, appt } = window._allFeedback[index];
  const fullName = `${student.fname} ${student.lname}`;
  const apptDate = new Date(appt.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  let badgeClass, badgeLabel;
  if (appt.response === 'yes')           { badgeClass = 'yes';  badgeLabel = '✅ Yes'; }
  else if (appt.response === 'no')       { badgeClass = 'no';   badgeLabel = '❌ No'; }
  else if (appt.response === 'auto-yes') { badgeClass = 'auto'; badgeLabel = '✅ Auto-Yes'; }

  const respDate = new Date(appt.date + 'T00:00:00');
  respDate.setDate(respDate.getDate() + 1);
  const responseDateLabel = respDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  document.getElementById('feedback-modal-body').innerHTML = `
    <div class="detail-row"><span class="d-label">Student Name</span><span class="d-value">${fullName}</span></div>
    <div class="detail-row"><span class="d-label">Student ID</span><span class="d-value">${student.sid}</span></div>
    <div class="detail-row"><span class="d-label">Appointment</span><span class="d-value">${apptDate} — ${appt.time}</span></div>
    <div class="detail-row"><span class="d-label">Purpose</span><span class="d-value">${appt.purpose}</span></div>
    <div class="detail-row"><span class="d-label">Response</span><span class="d-value"><span class="badge ${badgeClass}">${badgeLabel}</span></span></div>
    <div class="detail-row"><span class="d-label">Response Date</span><span class="d-value">${responseDateLabel}</span></div>
    <div class="detail-row"><span class="d-label">Comment</span><span class="d-value comment">${appt.comment || 'No comment provided'}</span></div>
  `;

  openModal('feedback-detail-modal');
}

loadFeedback();

// ─── Logout ───
function logout() {
  localStorage.removeItem('loggedInAdmin');
  window.location.href = '../login/login.html';
}

function openStudentApptsModal(sid, fullName) {
  const appointments = JSON.parse(localStorage.getItem(`appointments_${sid}`) || '[]');

  document.getElementById('student-appts-title').textContent = `${fullName}'s Appointments`;
  document.getElementById('student-appts-sub').textContent = `${appointments.length} total appointment${appointments.length !== 1 ? 's' : ''}`;

  const body = document.getElementById('student-appts-body');

  if (appointments.length === 0) {
    body.innerHTML = `<p style="text-align:center;padding:24px;color:var(--text-muted);font-style:italic">No appointments yet.</p>`;
    openModal('student-appts-modal');
    return;
  }

  const sorted = [...appointments].sort((a, b) => new Date(b.date) - new Date(a.date));

  body.innerHTML = `
    <table style="width:100%;border-collapse:collapse">
      <thead>
        <tr>
          <th style="font-size:.72rem;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:var(--text-muted);text-align:left;padding:8px 10px;border-bottom:2px solid var(--border)">Date</th>
          <th style="font-size:.72rem;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:var(--text-muted);text-align:left;padding:8px 10px;border-bottom:2px solid var(--border)">Time</th>
          <th style="font-size:.72rem;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:var(--text-muted);text-align:left;padding:8px 10px;border-bottom:2px solid var(--border)">Purpose</th>
        </tr>
      </thead>
      <tbody>
        ${sorted.map(appt => {
          const date = new Date(appt.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          return `
            <tr>
              <td data-label="Date" style="padding:10px;border-bottom:1px solid var(--border);font-size:.85rem;font-weight:600">${date}</td>
              <td data-label="Time" style="padding:10px;border-bottom:1px solid var(--border);font-size:.85rem"><span class="time-badge">${appt.time}</span></td>
              <td data-label="Purpose" style="padding:10px;border-bottom:1px solid var(--border);font-size:.85rem">${appt.purpose}</td>
            </tr>`;
        }).join('')}
      </tbody>
    </table>
  `;

  openModal('student-appts-modal');
}