// ─── Load Logged In Student ───
function getStudent() {
  return JSON.parse(localStorage.getItem('loggedInStudent'));
}
const loggedInStudent = getStudent();

if (!loggedInStudent) {
  window.location.href = '../login/login.html';
}

function loadStudentInfo() {
  const student = getStudent();
  if (!loggedInStudent) return;

  const fullName = `${student.fname} ${student.lname}`;
  const firstName = student.fname;
  const sid = student.sid;
  const credits = student.credits ?? 3;
  const initials = student.fname[0] + student.lname[0];

  const warning = document.getElementById('no-credits-warning');
  if (warning) warning.style.display = credits <= 0 ? 'flex' : 'none';

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  document.querySelector('#sec-dashboard .greeting h1').textContent = `${greeting}, ${firstName}!`;

  document.querySelector('.user-info .name').textContent = fullName;
  document.querySelector('.user-info .sid').textContent = sid;
  document.querySelector('.user-avatar').textContent = initials.toUpperCase();

  document.querySelectorAll('.credits-text').forEach(el => el.textContent = `${credits}/3`);
  document.querySelectorAll('.credits-value').forEach(el => el.textContent = `${credits} of 3 remaining`);

  const offsets = { 3: 0, 2: 41.89, 1: 83.78, 0: 125.66 };
  document.querySelectorAll('.ring-fill').forEach(el => {
    el.setAttribute('stroke-dashoffset', offsets[credits] ?? 0);
  });

  const creditsLeftEl = document.querySelector('#sec-dashboard .card:nth-child(2) [style*="accent"]');
  if (creditsLeftEl) creditsLeftEl.textContent = `${credits}/3`;

  loadPostAppointmentNotification();
  loadUpcomingAppointments();
  loadQuickOverview();
  loadReminderNotification();
  loadHistory();
}

loadStudentInfo();

function logout() {
  localStorage.removeItem('loggedInStudent');
  window.location.href = '../login/login.html';
}

// ─── Sidebar Toggle (mobile) ───
function toggleSidebar(){
  document.getElementById('sidebar').classList.toggle('open');
  document.querySelector('.sidebar-overlay').classList.toggle('show');
}

// ─── Section Navigation ───
function showSection(section, btn){
  document.querySelectorAll('.main > div[id^="sec-"]').forEach(s=>s.style.display='none');
  document.getElementById('sec-'+section).style.display='block';
  document.querySelectorAll('.nav-item').forEach(b=>b.classList.remove('active'));
  if(btn) btn.classList.add('active');
  // close mobile sidebar
  document.getElementById('sidebar').classList.remove('open');
  document.querySelector('.sidebar-overlay').classList.remove('show');
}

// ─── Calendar State ───
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let selectedDateStr = null;

const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];
const DAYS_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

// Only Tue=2, Wed=3, Thu=4 are bookable
const BOOKABLE_DAYS = [2, 3, 4];

function renderCalendar() {
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrev = new Date(currentYear, currentMonth, 0).getDate();
  const today = new Date();
  today.setHours(0,0,0,0);

  // Update header
  document.querySelector('#sec-book .calendar-nav .month').textContent =
    `${MONTHS[currentMonth]} ${currentYear}`;

  // Get booked slots from localStorage
  const appointments = JSON.parse(localStorage.getItem(`appointments_${loggedInStudent.sid}`) || '[]');

  // Build grid
  const grid = document.getElementById('cal-grid-body');
  grid.innerHTML = '';

  // Prev month fillers
  for (let i = 0; i < firstDay; i++) {
    const d = document.createElement('div');
    d.className = 'cal-day other-month';
    d.textContent = daysInPrev - firstDay + 1 + i;
    grid.appendChild(d);
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day);
    const dow = date.getDay();
    const dateStr = `${currentYear}-${String(currentMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    const isToday = date.getTime() === today.getTime();
    const isPast = date < today;
    const isBookable = BOOKABLE_DAYS.includes(dow);
    const noCredits = (getStudent().credits ?? 3) <= 0;
    const now = new Date();
    const isTodayAfter4PM = isToday && now.getHours() >= 16;

    const bookingsOnDay = JSON.parse(localStorage.getItem(`day_${dateStr}`) || '[]');
    const isFull = bookingsOnDay.length >= 3;
    const alreadyBooked = appointments.find(a => a.date === dateStr);

    const d = document.createElement('div');
    d.textContent = day;

    // AFTER
    if (isToday && (isTodayAfter4PM || !isBookable || alreadyBooked || isFull || noCredits)) {
      d.className = 'cal-day today';
    } else if (isToday && !isTodayAfter4PM && isBookable && !alreadyBooked && !isFull && !noCredits) {
      d.className = 'cal-day today available';
      d.onclick = () => selectDate(d, dateStr);
      const dotsEl = document.createElement('div');
      dotsEl.className = 'slot-dots';
      for (let i = 0; i < 3; i++) {
        const dot = document.createElement('span');
        dot.className = 'slot-dot' + (i < bookingsOnDay.length ? ' taken' : '');
        dotsEl.appendChild(dot);
      }
      d.appendChild(dotsEl);
    } else if (isPast || !isBookable || noCredits) {
      d.className = 'cal-day';
      d.style.opacity = '.35';
    } else if (alreadyBooked) {
      d.className = 'cal-day full';
      d.title = 'You already have an appointment this day';
    } else if (isFull) {
      d.className = 'cal-day full';
      d.title = 'No slots available';
    } else {
      d.className = 'cal-day available';
      d.onclick = () => selectDate(d, dateStr);
      const dotsEl = document.createElement('div');
      dotsEl.className = 'slot-dots';
      for (let i = 0; i < 3; i++) {
        const dot = document.createElement('span');
        dot.className = 'slot-dot' + (i < bookingsOnDay.length ? ' taken' : '');
        dotsEl.appendChild(dot);
      }
      d.appendChild(dotsEl);
    }
    if (dateStr === selectedDateStr) d.classList.add('selected');
    grid.appendChild(d);
  }

  // Next month fillers
  const totalCells = grid.children.length;
  const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  for (let i = 1; i <= remaining; i++) {
    const d = document.createElement('div');
    d.className = 'cal-day other-month';
    d.textContent = i;
    grid.appendChild(d);
  }
}

function prevMonth() {
  currentMonth--;
  if (currentMonth < 0) { currentMonth = 11; currentYear--; }
  renderCalendar();
}

function nextMonth() {
  currentMonth++;
  if (currentMonth > 11) { currentMonth = 0; currentYear++; }
  renderCalendar();
}

// ─── Calendar Date Selection ───
function selectDate(el, dateStr) {
  selectedDateStr = dateStr;
  renderCalendar(); // re-render to move selected highlight

  const date = new Date(dateStr);
  const label = date.toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' });

  document.getElementById('booking-placeholder').style.display = 'none';
  document.getElementById('booking-panel').classList.add('show');
  document.getElementById('selected-date-label').innerHTML =
    `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg> ${label}`;

  // Reset selections
  document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
  document.querySelectorAll('#sec-book .purpose-opt').forEach(p => p.classList.remove('selected'));

  // Mark taken slots
  const bookingsOnDay = JSON.parse(localStorage.getItem(`day_${dateStr}`) || '[]');
  const takenTimes = bookingsOnDay.map(b => b.time);
  document.querySelectorAll('.time-slot').forEach(slot => {
    slot.classList.toggle('taken', takenTimes.includes(slot.textContent.trim()));
    slot.onclick = slot.classList.contains('taken') ? null : () => selectSlot(slot);
  });

  const todayStr = new Date().toISOString().split('T')[0];
  if (dateStr === todayStr) {
    const nowHour = new Date().getHours();
    const nowMin = new Date().getMinutes();
    document.querySelectorAll('.time-slot').forEach(slot => {
      const slotTime = to24Hour(slot.textContent.trim());
      const [slotH, slotM] = slotTime.split(':').map(Number);
      if (slotH < nowHour || (slotH === nowHour && slotM <= nowMin)) {
        slot.classList.add('taken');
        slot.onclick = null;
      }
    });
  }
}

// ─── Time Slot Selection ───
function selectSlot(el) {
  if (el.classList.contains('taken')) return;
  el.closest('.time-slots').querySelectorAll('.time-slot')
    .forEach(s => s.classList.remove('selected'));
  el.classList.add('selected');
}

// Run on load
renderCalendar();

// ─── Purpose Selection ───
function selectPurpose(el){
  el.closest('.purpose-options').querySelectorAll('.purpose-opt')
    .forEach(p => p.classList.remove('selected'));
  el.classList.add('selected');
}

// ─── Radio Selection (post-appt) ───
function selectRadio(el, type){
  document.querySelectorAll('.radio-opt').forEach(r=>{r.classList.remove('sel-yes','sel-no')});
  el.classList.add(type==='yes'?'sel-yes':'sel-no');
}

// ─── Modals ───
function openModal(id){
  document.getElementById(id).classList.add('show');
}
function closeModal(id){
  document.getElementById(id).classList.remove('show');
}
// close on backdrop click
document.querySelectorAll('.modal-overlay').forEach(o=>{
  o.addEventListener('click',function(e){
    if(e.target===this) this.classList.remove('show');
  });
});

// ─── Reschedule Calendar State ───
let reschedMonth = new Date().getMonth();
let reschedYear = new Date().getFullYear();
let reschedSelectedDate = null;
let reschedApptId = null;

function openRescheduleModal(apptId) {
  reschedApptId = apptId;
  reschedSelectedDate = null;
  reschedMonth = new Date().getMonth();
  reschedYear = new Date().getFullYear();

  const appointments = JSON.parse(localStorage.getItem(`appointments_${loggedInStudent.sid}`) || '[]');
  const appt = appointments.find(a => a.id == apptId);
  if (!appt) return;

  const dateLabel = new Date(appt.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  document.getElementById('reschedule-current-label').textContent = `${dateLabel} · ${appt.time}`;

  // Reset UI
  document.getElementById('resched-cal-section').style.display = 'block';      // ← ADD
  document.getElementById('resched-date-label').style.display = 'none';
  document.getElementById('resched-time-section').style.display = 'none';
  document.querySelectorAll('#resched-slots .time-slot').forEach(s => s.classList.remove('selected', 'taken'));
  document.querySelectorAll('#reschedule-purposes .purpose-opt').forEach(p => p.classList.remove('selected'));

  // Pre-select current purpose
  document.querySelectorAll('#reschedule-purposes .purpose-opt').forEach(p => {
    if (p.textContent.trim() === appt.purpose) p.classList.add('selected');
  });

  renderReschedCalendar();
  openModal('reschedule-modal');
}

function renderReschedCalendar() {
  const firstDay = new Date(reschedYear, reschedMonth, 1).getDay();
  const daysInMonth = new Date(reschedYear, reschedMonth + 1, 0).getDate();
  const daysInPrev = new Date(reschedYear, reschedMonth, 0).getDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  document.getElementById('resched-month-label').textContent =
    `${MONTHS[reschedMonth]} ${reschedYear}`;

  const appointments = JSON.parse(localStorage.getItem(`appointments_${loggedInStudent.sid}`) || '[]');
  const grid = document.getElementById('resched-cal-body');
  grid.innerHTML = '';

  // Fillers
  for (let i = 0; i < firstDay; i++) {
    const d = document.createElement('div');
    d.className = 'cal-day other-month';
    d.textContent = daysInPrev - firstDay + 1 + i;
    grid.appendChild(d);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(reschedYear, reschedMonth, day);
    const dow = date.getDay();
    const dateStr = `${reschedYear}-${String(reschedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isPast = date < today;
    const isBookable = BOOKABLE_DAYS.includes(dow);
    const bookingsOnDay = JSON.parse(localStorage.getItem(`day_${dateStr}`) || '[]');

    // Exclude the current appointment's slot from the full count
    const currentAppt = appointments.find(a => a.id == reschedApptId);
    const effectiveBookings = bookingsOnDay.filter(b =>
      !(currentAppt && currentAppt.date === dateStr && b.sid === loggedInStudent.sid && b.time === currentAppt.time)
    );
    const isFull = effectiveBookings.length >= 3;

    // Block days where student already has another appointment (not the one being rescheduled)
    const otherAppt = appointments.find(a => a.date === dateStr && a.id != reschedApptId);

    const d = document.createElement('div');
    d.textContent = day;

    if (isPast || !isBookable || otherAppt) {
      d.className = 'cal-day';
      d.style.opacity = '.35';
    } else if (isFull) {
      d.className = 'cal-day full';
      d.title = 'No slots available';
    } else {
      d.className = 'cal-day available';
      d.onclick = () => selectReschedDate(d, dateStr);
      const dotsEl = document.createElement('div');
      dotsEl.className = 'slot-dots';
      for (let i = 0; i < 3; i++) {
        const dot = document.createElement('span');
        dot.className = 'slot-dot' + (i < effectiveBookings.length ? ' taken' : '');
        dotsEl.appendChild(dot);
      }
      d.appendChild(dotsEl);
    }

    if (dateStr === reschedSelectedDate) d.classList.add('selected');
    grid.appendChild(d);
  }

  // Trailing fillers
  const total = grid.children.length;
  const rem = total % 7 === 0 ? 0 : 7 - (total % 7);
  for (let i = 1; i <= rem; i++) {
    const d = document.createElement('div');
    d.className = 'cal-day other-month';
    d.textContent = i;
    grid.appendChild(d);
  }
}

function reschedPrevMonth() {
  reschedMonth--;
  if (reschedMonth < 0) { reschedMonth = 11; reschedYear--; }
  renderReschedCalendar();
}

function reschedNextMonth() {
  reschedMonth++;
  if (reschedMonth > 11) { reschedMonth = 0; reschedYear++; }
  renderReschedCalendar();
}

function selectReschedDate(el, dateStr) {
  reschedSelectedDate = dateStr;
  renderReschedCalendar();

  document.getElementById('resched-cal-section').style.display = 'none';

  const date = new Date(dateStr);
  const label = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  const labelEl = document.getElementById('resched-date-label');
  labelEl.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
    <span>${label}</span>
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
  `;
  labelEl.style.display = 'inline-flex';

  document.getElementById('resched-time-section').style.display = 'block';

  // Mark taken slots (excluding current appt slot on same day)
  const appointments = JSON.parse(localStorage.getItem(`appointments_${loggedInStudent.sid}`) || '[]');
  const currentAppt = appointments.find(a => a.id == reschedApptId);
  const bookingsOnDay = JSON.parse(localStorage.getItem(`day_${dateStr}`) || '[]');
  const takenTimes = bookingsOnDay
    .filter(b => !(currentAppt && currentAppt.date === dateStr && b.sid === loggedInStudent.sid && b.time === currentAppt.time))
    .map(b => b.time);

  document.querySelectorAll('#resched-slots .time-slot').forEach(slot => {
    const isTaken = takenTimes.includes(slot.textContent.trim());
    slot.classList.toggle('taken', isTaken);
    slot.classList.remove('selected');
    slot.onclick = isTaken ? null : () => selectReschedSlot(slot);
  });
}

function selectReschedSlot(el) {
  if (el.classList.contains('taken')) return;
  document.querySelectorAll('#resched-slots .time-slot').forEach(s => s.classList.remove('selected'));
  el.classList.add('selected');
}

function selectReschedulePurpose(el) {
  document.querySelectorAll('#reschedule-purposes .purpose-opt').forEach(p => p.classList.remove('selected'));
  el.classList.add('selected');
}

function confirmReschedule() {
  if (!reschedSelectedDate) { alert('Please select a new date.'); return; }
  const timeEl = document.querySelector('#resched-slots .time-slot.selected');
  if (!timeEl) { alert('Please select a new time.'); return; }
  const purposeEl = document.querySelector('#reschedule-purposes .purpose-opt.selected');
  if (!purposeEl) { alert('Please select a purpose.'); return; }

  const newDate = reschedSelectedDate;
  const newTime = timeEl.textContent.trim();
  const newPurpose = purposeEl.textContent.trim();

  const key = `appointments_${loggedInStudent.sid}`;
  const appointments = JSON.parse(localStorage.getItem(key) || '[]');
  const appt = appointments.find(a => a.id == reschedApptId);
  if (!appt) return;

  // Remove old day slot
  const oldDayKey = `day_${appt.date}`;
  const oldDaySlots = JSON.parse(localStorage.getItem(oldDayKey) || '[]');
  localStorage.setItem(oldDayKey, JSON.stringify(
    oldDaySlots.filter(s => !(s.sid === loggedInStudent.sid && s.time === appt.time))
  ));

  // Add new day slot
  const newDayKey = `day_${newDate}`;
  const newDaySlots = JSON.parse(localStorage.getItem(newDayKey) || '[]');
  newDaySlots.push({ sid: loggedInStudent.sid, time: newTime });
  localStorage.setItem(newDayKey, JSON.stringify(newDaySlots));

  // Update appointment
  appt.date = newDate;
  appt.time = newTime;
  appt.purpose = newPurpose;
  localStorage.setItem(key, JSON.stringify(appointments));

  closeModal('reschedule-modal');
  loadStudentInfo();
}

function loadUpcomingAppointments() {
  const appointments = JSON.parse(localStorage.getItem(`appointments_${loggedInStudent.sid}`) || '[]');
  const list = document.getElementById('appointment-list');
  const noApptState = document.getElementById('no-appt-state');
  const badge = document.getElementById('appt-badge');

  const today = new Date();
  today.setHours(0,0,0,0);
  const now = new Date();

  const upcoming = appointments
    .filter(a => {
      if (a.response) return false;
      const apptDateTime = new Date(`${a.date}T${to24Hour(a.time)}`);
      const oneHourAfter = new Date(apptDateTime.getTime() + 60 * 60 * 1000);
      return now < oneHourAfter;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // Clear existing cards and dividers
  list.querySelectorAll('.appt-card, .now-divider').forEach(c => c.remove());

  if (upcoming.length === 0) {
    noApptState.style.display = 'block';
    badge.textContent = '0 booked';
    return;
  }

  noApptState.style.display = 'none';
  badge.textContent = `${upcoming.length} booked`;

  // Separate today vs future
  const todayAppts = upcoming.filter(a => new Date(a.date).toDateString() === now.toDateString());
  const futureAppts = upcoming.filter(a => new Date(a.date).toDateString() !== now.toDateString());

  // Render today's appointments
  todayAppts.forEach(appt => {
    list.insertBefore(buildApptCard(appt, now), noApptState);
  });

  // Insert divider only if there are BOTH today and future appointments
  if (todayAppts.length > 0 && futureAppts.length > 0) {
    const divider = document.createElement('div');
    divider.className = 'now-divider';
    divider.innerHTML = 'Upcoming';
    list.insertBefore(divider, noApptState);
  }

  // Render future appointments
  futureAppts.forEach(appt => {
    list.insertBefore(buildApptCard(appt, now), noApptState);
  });
}

function buildApptCard(appt, now) {
  const apptDate = new Date(appt.date);
  const isToday = apptDate.toDateString() === now.toDateString();

  // Use actual appointment datetime for 48-hour check
  const apptDateTime = new Date(`${appt.date}T${to24Hour(appt.time)}`);
  const diffHours = (apptDateTime - now) / 36e5;

  const isNow = isToday;
  const isLocked = isNow || (!isToday && diffHours < 48);

  const day = apptDate.getDate();
  const month = apptDate.toLocaleDateString('en-US', { month: 'short' });
  const weekday = apptDate.toLocaleDateString('en-US', { weekday: 'long' });

  const card = document.createElement('div');
  card.className = 'appt-card';
  if (isNow) card.classList.add('appt-card--today');

  card.innerHTML = `
    <div class="appt-date-box" style="background:${isLocked ? 'var(--primary)' : 'var(--accent)'}">
      <span class="day">${day}</span>
      <span class="month">${month}</span>
    </div>
    <div class="appt-details">
      <div class="appt-purpose">${appt.purpose}</div>
      <div class="appt-meta">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        ${appt.time} · ${isToday ? 'Today' : weekday}
      </div>
    </div>
    <span class="appt-status ${isNow ? 'now' : isLocked ? 'confirmed' : 'upcoming'}">
      ${isNow ? 'Now' : isLocked ? 'Confirmed' : 'Upcoming'}
    </span>
    <div class="appt-actions">
      <button class="appt-action-btn ${isLocked ? 'disabled' : ''}"
        title="${isLocked ? 'Cannot reschedule (within 48hrs)' : 'Reschedule'}"
        ${isLocked ? 'disabled' : `onclick="openRescheduleModal('${appt.id}')"`}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
      </button>
      <button class="appt-action-btn danger ${isLocked ? 'disabled' : ''}"
        title="${isLocked ? 'Cannot cancel (within 48hrs)' : 'Cancel'}"
        ${isLocked ? 'disabled' : `onclick="openCancelModal('${appt.id}')"`}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
      ${isLocked ? `
        <button class="appt-action-btn" title="View Confirmation Slip" onclick="openSlipModal('${appt.id}')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
      </button>` : ''}
    </div>
  `;

  return card;
}

function confirmBooking() {
  const dateStr = selectedDateStr;
  const timeEl = document.querySelector('#sec-book .time-slot.selected');
  const purposeEl = document.querySelector('#sec-book .purpose-opt.selected');

  if (!dateStr || !timeEl || !purposeEl) return;

  const time = timeEl.textContent.trim();
  const purpose = purposeEl.textContent.trim();

  // Save to student's appointments
  const key = `appointments_${loggedInStudent.sid}`;
  const appointments = JSON.parse(localStorage.getItem(key) || '[]');
  const newAppt = {
    id: Date.now(),
    date: dateStr,
    time,
    purpose,
    status: 'confirmed'
  };
  appointments.push(newAppt);
  localStorage.setItem(key, JSON.stringify(appointments));

  // Save to day slots (shared — for slot tracking)
  const dayKey = `day_${dateStr}`;
  const daySlots = JSON.parse(localStorage.getItem(dayKey) || '[]');
  daySlots.push({ sid: loggedInStudent.sid, time });
  localStorage.setItem(dayKey, JSON.stringify(daySlots));

  // Deduct credit
  const students = JSON.parse(localStorage.getItem('students') || '[]');
  const idx = students.findIndex(s => s.sid === loggedInStudent.sid);
  if (idx !== -1 && students[idx].credits > 0) {
    students[idx].credits--;
    localStorage.setItem('students', JSON.stringify(students));
    const updated = { ...JSON.parse(localStorage.getItem('loggedInStudent')), credits: students[idx].credits };
    localStorage.setItem('loggedInStudent', JSON.stringify(updated));
  }

  closeModal('confirm-modal');
  openModal('success-modal');

  resetBookingPanel();
  loadStudentInfo();
}

function openConfirmModal() {
  const credits = (getStudent().credits ?? 3);
  if (credits <= 0) {
    alert('You have no remaining credits and cannot book an appointment.');
    return;
  }
  const timeEl = document.querySelector('#sec-book .time-slot.selected');
  const purposeEl = document.querySelector('#sec-book .purpose-opt.selected');

  if (!selectedDateStr) { alert('Please select a date.'); return; }
  if (!timeEl) { alert('Please select a time.'); return; }
  if (!purposeEl) { alert('Please select a purpose.'); return; }

  const date = new Date(selectedDateStr);
  const label = date.toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' });

  document.getElementById('confirm-date').textContent = label;
  document.getElementById('confirm-time').textContent = timeEl.textContent.trim();
  document.getElementById('confirm-purpose').textContent = purposeEl.textContent.trim();
  document.querySelector('#confirm-modal .slip-row:last-child .slip-value').textContent =
    `${credits - 1} / 3`;

  openModal('confirm-modal');
}

function loadQuickOverview() {
  const student = getStudent();
  const appointments = JSON.parse(localStorage.getItem(`appointments_${student.sid}`) || '[]');
  const credits = student.credits ?? 3;
  const today = new Date();
  today.setHours(0,0,0,0);

  // Total Booked (all appointments ever)
  const totalBooked = appointments.length;

  // Attended (past appointments with Yes or Auto-Yes response)
  const attended = appointments.filter(a => a.response === 'yes' || a.response === 'auto-yes').length;

  // Next Appointment
  const now = new Date();
  const upcoming = appointments
      .filter(a => {
        if (a.response) return false;
        const apptDateTime = new Date(`${a.date}T${to24Hour(a.time)}`);
        const oneHourAfter = new Date(apptDateTime.getTime() + 60 * 60 * 1000);
        return now < oneHourAfter;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));

  const nextAppt = upcoming[0];
  let nextLabel = '—';
  if (nextAppt) {
    const apptDate = new Date(nextAppt.date);
    const isToday = apptDate.toDateString() === new Date().toDateString();
    nextLabel = `${isToday ? 'Today' : apptDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · ${nextAppt.time}`;
  }

  // Update DOM
  const overviewCard = document.querySelector('#sec-dashboard .card:nth-child(2)');
  const stats = overviewCard.querySelectorAll('[style*="background:var(--bg)"]');

  // Total Booked
  stats[0].querySelector('[style*="1.3rem"]').textContent = totalBooked;

  // Attended
  stats[1].querySelector('[style*="1.3rem"]').textContent = attended;

  // Credits Left
  stats[2].querySelector('[style*="1.3rem"]').textContent = `${credits}/3`;

  // Next Appointment
  stats[3].querySelector('[style*=".92rem"]').textContent = nextLabel;
}

function submitPostAppt() {
  const selected = document.querySelector('.radio-opt.sel-yes, .radio-opt.sel-no');
  if (!selected) { alert('Please select Yes or No.'); return; }

  const isYes = selected.classList.contains('sel-yes');
  const comment = document.querySelector('#post-appt-modal textarea').value.trim();

  // Update the appointment response in localStorage
  const key = `appointments_${loggedInStudent.sid}`;
  const appointments = JSON.parse(localStorage.getItem(key) || '[]');

  // Find the most recent past appointment without a response
  const today = new Date();
  const target = appointments
    .filter(a => {
      if (a.response) return false;
      const apptDateTime = new Date(`${a.date}T${to24Hour(a.time)}`);
      const oneHourAfter = new Date(apptDateTime.getTime() + 60 * 60 * 1000);
      return new Date() >= oneHourAfter;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

  if (target) {
    target.response = isYes ? 'yes' : 'no';
    target.comment = comment || 'No comment provided';
    localStorage.setItem(key, JSON.stringify(appointments));
  }

  closeModal('post-appt-modal');
  loadStudentInfo();
  loadPostAppointmentNotification();
}

function openSlipModal(apptId) {
  const student = getStudent();
  const appointments = JSON.parse(localStorage.getItem(`appointments_${student.sid}`) || '[]');
  const appt = appointments.find(a => a.id == apptId);
  if (!appt) return;

  const fullName = `${student.fname} ${student.lname}`;
  const date = new Date(appt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const creditsUsed = 3 - (student.credits ?? 3);

  document.getElementById('slip-name').textContent = fullName;
  document.getElementById('slip-sid').textContent = student.sid;
  document.getElementById('slip-date').textContent = date;
  document.getElementById('slip-time').textContent = appt.time;
  document.getElementById('slip-purpose').textContent = appt.purpose;
  document.getElementById('slip-credits').textContent = `${creditsUsed} / 3`;

  openModal('slip-modal');
}

function openCancelModal(apptId) {
  const appointments = JSON.parse(localStorage.getItem(`appointments_${loggedInStudent.sid}`) || '[]');
  const appt = appointments.find(a => a.id == apptId);
  if (!appt) return;

  const date = new Date(appt.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  document.getElementById('cancel-appt-date').textContent = `${date} at ${appt.time}`;
  document.getElementById('cancel-confirm-btn').onclick = () => executeCancel(apptId);

  openModal('cancel-modal');
}

function executeCancel(apptId) {
  const key = `appointments_${loggedInStudent.sid}`;
  const appointments = JSON.parse(localStorage.getItem(key) || '[]');
  const appt = appointments.find(a => a.id == apptId);
  if (!appt) return;

  // Remove from student's appointments
  const updated = appointments.filter(a => a.id != apptId);
  localStorage.setItem(key, JSON.stringify(updated));

  // Remove from day slots
  const dayKey = `day_${appt.date}`;
  const daySlots = JSON.parse(localStorage.getItem(dayKey) || '[]');
  const updatedDay = daySlots.filter(s => !(s.sid === loggedInStudent.sid && s.time === appt.time));
  localStorage.setItem(dayKey, JSON.stringify(updatedDay));

  // Restore credit
  const students = JSON.parse(localStorage.getItem('students') || '[]');
  const idx = students.findIndex(s => s.sid === loggedInStudent.sid);
  if (idx !== -1) {
    students[idx].credits = Math.min(3, (students[idx].credits ?? 0) + 1);
    localStorage.setItem('students', JSON.stringify(students));
    const updatedStudent = { ...getStudent(), credits: students[idx].credits };
    localStorage.setItem('loggedInStudent', JSON.stringify(updatedStudent));
  }

  closeModal('cancel-modal');
  loadStudentInfo();
}

function resetBookingPanel() {
  selectedDateStr = null;

  // Hide panel, show placeholder
  document.getElementById('booking-panel').classList.remove('show');
  document.getElementById('booking-placeholder').style.display = 'block';

  // Clear all selections
  document.querySelectorAll('#sec-book .time-slot').forEach(s => {
    s.classList.remove('selected', 'taken');
    s.onclick = () => selectSlot(s);
  });
  document.querySelectorAll('#sec-book .purpose-opt').forEach(p => p.classList.remove('selected'));

  // Re-render calendar to remove selected highlight
  renderCalendar();
}

function loadReminderNotification() {
  const student = getStudent();
  const appointments = JSON.parse(localStorage.getItem(`appointments_${student.sid}`) || '[]');
  const now = new Date();
  const notif = document.getElementById('notif-reminder');
  const notifText = document.getElementById('notif-reminder-text');

  // Find appointments within 48 hours from now (and still in the future)
  const urgent = appointments
    .filter(a => {
      const apptDateTime = new Date(`${a.date}T${to24Hour(a.time)}`);
      const diffHours = (apptDateTime - now) / 36e5;
      return diffHours >= 0 && diffHours <= 48;
    })
    .sort((a, b) => {
      return new Date(`${a.date}T${to24Hour(a.time)}`) - new Date(`${b.date}T${to24Hour(b.time)}`);
    });

  if (urgent.length === 0) {
    notif.style.display = 'none';
    return;
  }

  const next = urgent[0];
  const apptDate = new Date(next.date);
  const isToday = apptDate.toDateString() === now.toDateString();
  const dateLabel = isToday ? 'Today' : apptDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  notifText.innerHTML = `<strong>Reminder:</strong> You have an appointment ${isToday ? '' : 'on <strong>' + dateLabel + '</strong>'} at <strong>${next.time}</strong> — ${next.purpose}`;
  notif.style.display = 'flex';
}

// Helper: convert "4:30 PM" → "16:30:00"
function to24Hour(timeStr) {
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':');
  if (modifier === 'PM' && hours !== '12') hours = parseInt(hours) + 12;
  if (modifier === 'AM' && hours === '12') hours = '00';
  return `${String(hours).padStart(2, '0')}:${minutes}:00`;
}

function loadHistory() {
  const student = getStudent();
  const appointments = JSON.parse(localStorage.getItem(`appointments_${student.sid}`) || '[]');
  const tbody = document.getElementById('history-tbody');
  const now = new Date();

  // Show appointments where 1 hour has passed OR has a response
  const history = appointments
    .filter(a => {
      const apptDateTime = new Date(`${a.date}T${to24Hour(a.time)}`);
      const oneHourAfter = new Date(apptDateTime.getTime() + 60 * 60 * 1000);
      return now >= oneHourAfter || a.response;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  if (history.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center;padding:32px;color:var(--text-muted);font-style:italic">
          No past appointments yet.
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = history.map(a => {
    const date = new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    let badgeClass = 'pending-resp';
    let badgeLabel = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Pending';
    let respondBtn = '';
    if (a.response === 'yes')           { badgeClass = 'yes';  badgeLabel = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg> Yes'; }
    else if (a.response === 'no')       { badgeClass = 'no';   badgeLabel = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> No'; }
    else if (a.response === 'auto-yes') { badgeClass = 'auto'; badgeLabel = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg> Auto-Yes'; }
    else {
      respondBtn = `<button class="respond-btn" onclick="openModal('post-appt-modal')">Respond</button>`;
    }

    const comment = a.comment
      ? `<span style="color:var(--text-muted);font-style:italic">"${a.comment}"</span>`
      : `<span style="color:var(--text-muted)">—</span>`;

    return `
      <tr>
        <td data-label="Date"><strong>${date}</strong></td>
        <td data-label="Time">${a.time}</td>
        <td data-label="Purpose">${a.purpose}</td>
        <td data-label="Response"><span class="response-badge ${badgeClass}">${badgeLabel}</span></td>
        <td data-label="Comment">${comment}</td>
        <td data-label="Action">${respondBtn || '<span style="color:var(--text-muted)">—</span>'}</td>
      </tr>`;
  }).join('');
}

function downloadSlipAsPNG() {
  const modal = document.querySelector('#slip-modal .modal');
  const actions = modal.querySelector('.modal-actions');

  // Temporarily hide buttons
  actions.style.display = 'none';

  html2canvas(modal, {
    scale: 2,
    backgroundColor: '#ffffff',
    useCORS: true
  }).then(canvas => {
    // Get appointment date for filename
    const dateText = document.getElementById('slip-date').textContent.trim();
    const dateObj = new Date(dateText);
    const formatted = dateObj.toLocaleDateString('en-US', {
      month: '2-digit', day: '2-digit', year: 'numeric'
    }).replace(/\//g, '-');

    const link = document.createElement('a');
    link.download = `confirmation-slip-${formatted}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    // Restore buttons
    actions.style.display = 'flex';
  });
}

function loadPostAppointmentNotification() {
  const student = getStudent();
  const appointments = JSON.parse(localStorage.getItem(`appointments_${student.sid}`) || '[]');
  const now = new Date();
  const notif = document.getElementById('notif-post');

  // Auto-yes: if 24 hours have passed since appointment and still no response
  appointments.forEach(a => {
    if (a.response) return;

    const apptDateTime = new Date(`${a.date}T${to24Hour(a.time)}`);
    const oneDayAfter = new Date(apptDateTime.getTime() + 24 * 60 * 60 * 1000);

    if (now >= oneDayAfter) {
      a.response = 'auto-yes';
      a.comment = 'No comment provided';
    }
  });

  // Save auto-yes updates
  localStorage.setItem(`appointments_${student.sid}`, JSON.stringify(appointments));

  // Find appointments where 1 hour has passed since appointment time, no response yet
  const pending = appointments
    .filter(a => {
      if (a.response) return false;

      const apptDateTime = new Date(`${a.date}T${to24Hour(a.time)}`);
      const oneHourAfter = new Date(apptDateTime.getTime() + 60 * 60 * 1000);

      return now >= oneHourAfter;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  if (pending.length === 0) {
    notif.style.display = 'none';
    return;
  }

  const appt = pending[0];
  const dateLabel = new Date(appt.date).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric'
  });

  document.getElementById('notif-post-text').innerHTML =
    `Did you attend your appointment on <strong>${dateLabel} at ${appt.time}</strong>? Please confirm.`;

  document.getElementById('post-appt-modal-sub').innerHTML =
    `Did you attend your appointment on <strong>${dateLabel} at ${appt.time}</strong>?`;

  notif.style.display = 'flex';
}

function reschedChangeDate() {
  reschedSelectedDate = null;
  document.getElementById('resched-cal-section').style.display = 'block';
  document.getElementById('resched-date-label').style.display = 'none';
  document.getElementById('resched-time-section').style.display = 'none';
  renderReschedCalendar();
}

// Sync credits if admin updates them
window.addEventListener('storage', function(e) {
  if (e.key === 'loggedInStudent' || e.key === 'students') {
    const students = JSON.parse(localStorage.getItem('students') || '[]');
    const loggedIn = JSON.parse(localStorage.getItem('loggedInStudent') || 'null');
    if (!loggedIn) return;
    const match = students.find(s => s.sid === loggedIn.sid);
    if (match) {
      loggedIn.credits = match.credits;
      localStorage.setItem('loggedInStudent', JSON.stringify(loggedIn));
    }
    loadStudentInfo();
    renderCalendar(); // ← ADD THIS
  }
});