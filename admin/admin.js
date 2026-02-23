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