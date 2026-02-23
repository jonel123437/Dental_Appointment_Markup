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

// ─── Calendar Date Selection ───
function selectDate(el, label){
  document.querySelectorAll('.cal-day').forEach(d=>d.classList.remove('selected'));
  el.classList.add('selected');
  document.getElementById('booking-placeholder').style.display='none';
  document.getElementById('booking-panel').classList.add('show');
  document.getElementById('selected-date-label').innerHTML =
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg> '+label;
}

// ─── Time Slot Selection ───
function selectRescheduleSlot(el){
  if(el.classList.contains('taken')) return;
  el.closest('.time-slots').querySelectorAll('.time-slot')
    .forEach(s => s.classList.remove('selected'));
  el.classList.add('selected');
}

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

function selectReschedulePurpose(el) {
  document.querySelectorAll('#reschedule-purposes .purpose-opt')
    .forEach(p => p.classList.remove('selected'));
  el.classList.add('selected');
}

function confirmReschedule() {
  const date = document.getElementById('reschedule-date').value;
  const time = document.querySelector('#reschedule-slots .time-slot.selected');
  const purpose = document.querySelector('#reschedule-purposes .purpose-opt.selected');

  if (!date) {
    alert('Please select a new date.');
    return;
  }
  if (!time) {
    alert('Please select a new time.');
    return;
  }
  if (!purpose) {
    alert('Please select a purpose.');
    return;
  }

  closeModal('reschedule-modal');
  // plug in your save logic here
}