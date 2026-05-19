/* ============================================================
   TUTORES ON-LINE · script.js
   ============================================================ */

/* ================================================================
   1. TUTOR DATA
   ================================================================ */
const tutores = [
  {
    id: 1, name: 'Maria Garcia', specialty: 'Matematicas y Física',
    rating: 4.9, reviews: 127, price: 25000,
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    featured: true,
    descripcion: 'Profesora con más de 8 años de experiencia en Matemáticas y Física. Metodología clara y práctica orientada a resultados.',
    horarios: { Lunes: [{from:'09:00',to:'12:00'}], Miércoles: [{from:'14:00',to:'17:00'}], Viernes: [{from:'09:00',to:'11:00'}] }
  },
  {
    id: 2, name: 'Ana Martinez', specialty: 'Inglés',
    rating: 4.8, reviews: 95, price: 20000,
    avatar: 'https://randomuser.me/api/portraits/women/26.jpg',
    featured: false,
    descripcion: 'Profesora certificada de inglés con enfoque en conversación, gramática y preparación para exámenes internacionales.',
    horarios: { Martes: [{from:'10:00',to:'13:00'}], Jueves: [{from:'15:00',to:'18:00'}], Sábado: [{from:'09:00',to:'12:00'}] }
  },
  {
    id: 3, name: 'Carlos Hernadez', specialty: 'Programación',
    rating: 5.0, reviews: 142, price: 35000,
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    featured: false,
    descripcion: 'Ingeniero de software con 10 años de experiencia. Enseño Python, JavaScript, bases de datos y desarrollo web desde cero.',
    horarios: { Lunes: [{from:'18:00',to:'21:00'}], Miércoles: [{from:'18:00',to:'21:00'}], Viernes: [{from:'18:00',to:'20:00'}] }
  },
  {
    id: 4, name: 'Roberto Diaz', specialty: 'Química y Biología',
    rating: 4.7, reviews: 82, price: 22000,
    avatar: 'https://randomuser.me/api/portraits/men/75.jpg',
    featured: false,
    descripcion: 'Biólogo con maestría en ciencias naturales. Clases dinámicas con experimentos prácticos y material visual.',
    horarios: { Martes: [{from:'08:00',to:'11:00'}], Jueves: [{from:'08:00',to:'11:00'}], Sábado: [{from:'10:00',to:'13:00'}] }
  },
  {
    id: 5, name: 'Sofia Vargas', specialty: 'Historia y Filosofía',
    rating: 4.6, reviews: 64, price: 18000,
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    featured: false,
    descripcion: 'Historiadora y filósofa apasionada por el pensamiento crítico. Clases contextualizadas y debates enriquecedores.',
    horarios: { Lunes: [{from:'14:00',to:'17:00'}], Viernes: [{from:'14:00',to:'16:00'}] }
  },
  {
    id: 6, name: 'Jose Sarmiento', specialty: 'Contabilidad y Finanzas',
    rating: 4.9, reviews: 108, price: 28000,
    avatar: 'https://randomuser.me/api/portraits/men/11.jpg',
    featured: false,
    descripcion: 'Contador público con especialización en finanzas empresariales. Explico con casos reales y ejercicios prácticos.',
    horarios: { Miércoles: [{from:'09:00',to:'12:00'}], Viernes: [{from:'09:00',to:'12:00'}], Sábado: [{from:'14:00',to:'17:00'}] }
  }
];

/* ================================================================
   2. RENDER TUTOR CARDS (buscar-tutor.html)
   ================================================================ */
function renderTutores(list) {
  const grid = document.getElementById('tutoresGrid');
  if (!grid) return;

  grid.innerHTML = '';
  list.forEach(t => {
    const col = document.createElement('div');
    col.className = 'col-12 col-md-6';
    col.innerHTML = `
      <div class="tutor-card ${t.featured ? 'featured' : ''}">
        <img src="${t.avatar}" alt="${t.name}" class="tutor-avatar" />
        <div class="flex-grow-1">
          <p class="tutor-name mb-0">${t.name}</p>
          <p class="tutor-specialty">${t.specialty}</p>
          <span class="tutor-rating">⭐ ${t.rating} (${t.reviews} reseñas)</span>
          <p class="tutor-price">$${t.price.toLocaleString()} / hora</p>
        </div>
        <a href="Perfil_tutor.html?id=${t.id}" class="btn-profile align-self-end">Ver perfil</a>
      </div>`;
    grid.appendChild(col);
  });

  const counter = document.getElementById('tutoresCount');
  if (counter) counter.textContent = `${list.length} tutor${list.length !== 1 ? 'es' : ''} encontrado${list.length !== 1 ? 's' : ''}`;
}

function filterTutores() {
  const q = (document.getElementById('searchInput')?.value || '').toLowerCase();
  const materia = document.getElementById('filterMateria')?.value || '';
  const nivel = document.getElementById('filterNivel')?.value || '';

  const filtered = tutores.filter(t => {
    const matchQ = !q || t.name.toLowerCase().includes(q) || t.specialty.toLowerCase().includes(q);
    const matchM = !materia || t.specialty.toLowerCase().includes(materia.toLowerCase().split(' ')[0]);
    return matchQ && matchM;
  });
  renderTutores(filtered);
}

// Buscar_tutor.html maneja su propia carga y filtrado desde Supabase.
// app.js NO inicializa el grid en esa página para evitar conflictos.

/* ================================================================
   3. TUTOR PROFILE — SCHEDULE (perfil-tutor.html)
   ================================================================ */
const schedule = {
  Lunes:     ['9:00', '10:00', '11:00', '16:00', '17:00'],
  Martes:    ['9:00', '10:00', '14:00', '15:00', '16:00'],
  Miércoles: ['9:00', '10:00', '11:00', '16:00', '17:00'],
  Jueves:    ['14:00', '15:00', '16:00', '17:00', '18:00'],
  Viernes:   ['9:00', '10:00', '11:00', '12:00']
};

let selectedSlot = null;

function renderSchedule() {
  const container = document.getElementById('scheduleContainer');
  if (!container) return;

  container.innerHTML = '';
  Object.entries(schedule).forEach(([day, slots]) => {
    const dayDiv = document.createElement('div');
    dayDiv.className = 'schedule-day';
    dayDiv.innerHTML = `<p class="schedule-day-title">${day}</p>
      <div class="time-slots">
        ${slots.map(s => `<button class="time-slot-btn" onclick="selectSlot(this, '${day}', '${s}')">${s}</button>`).join('')}
      </div>`;
    container.appendChild(dayDiv);
  });
}

function selectSlot(btn, day, time) {
  document.querySelectorAll('.time-slot-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  selectedSlot = { day, time };
  const hint = document.getElementById('bookingHint');
  if (hint) hint.textContent = `Seleccionado: ${day} ${time}`;
}

// renderSchedule solo se usa como fallback en páginas sin carga dinámica.
// Perfil_tutor.html carga los horarios desde Supabase en su propio script.
if (document.getElementById('scheduleContainer') && !document.getElementById('pNombre')) renderSchedule();

/* ================================================================
   4. RESERVA PAGE — CALENDAR & TIME (reserva.html)
   ================================================================ */
let currentDate = new Date(); currentDate.setDate(1); // Mes actual
let selectedDate = null;
let selectedTime = null;
let selectedModality = null;

function renderCalendar() {
  const daysEl = document.getElementById('calendarDays');
  const labelEl = document.getElementById('calMonthYear');
  if (!daysEl) return;

  const months = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December'];
  labelEl.textContent = `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

  daysEl.innerHTML = '';
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const daysInPrev = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();

  const today = new Date();

  // Prev month days
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = document.createElement('div');
    d.className = 'cal-day other-month';
    d.textContent = daysInPrev - i;
    daysEl.appendChild(d);
  }

  // Current month
  for (let i = 1; i <= daysInMonth; i++) {
    const d = document.createElement('div');
    d.className = 'cal-day';
    d.textContent = i;

    const thisDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
    if (thisDate < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
      d.classList.add('disabled');
    } else {
      if (today.getDate() === i && today.getMonth() === currentDate.getMonth() && today.getFullYear() === currentDate.getFullYear()) {
        d.classList.add('today');
      }
      if (selectedDate && selectedDate.getDate() === i && selectedDate.getMonth() === currentDate.getMonth()) {
        d.classList.add('selected');
      }
      d.addEventListener('click', () => selectDay(i, d));
    }
    daysEl.appendChild(d);
  }

  // Fill remaining
  const total = firstDay + daysInMonth;
  const remaining = total % 7 === 0 ? 0 : 7 - (total % 7);
  for (let i = 1; i <= remaining; i++) {
    const d = document.createElement('div');
    d.className = 'cal-day other-month';
    d.textContent = i;
    daysEl.appendChild(d);
  }
}

function selectDay(day, el) {
  document.querySelectorAll('.cal-day').forEach(d => d.classList.remove('selected'));
  el.classList.add('selected');
  selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
}

function renderTimeGrid() {
  const grid = document.getElementById('timeGrid');
  if (!grid) return;
  const times = ['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00'];
  grid.innerHTML = times.map(t =>
    `<button class="time-btn" onclick="selectTime(this, '${t}')">${t}</button>`
  ).join('');
}

function selectTime(btn, time) {
  document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  selectedTime = time;
}

function selectModality(type) {
  selectedModality = type;
  document.querySelectorAll('.modality-card').forEach(c => c.classList.remove('selected'));
  const card = document.getElementById(type === 'presencial' ? 'modPresencial' : 'modVirtual');
  if (card) card.classList.add('selected');
}

// Calendar navigation
document.getElementById('prevMonth')?.addEventListener('click', () => {
  currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
  renderCalendar();
});
document.getElementById('nextMonth')?.addEventListener('click', () => {
  currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
  renderCalendar();
});

// La confirmación de reserva la maneja api.js (guarda en Supabase).
// Este listener duplicado fue eliminado para evitar el doble disparo.

if (document.getElementById('calendarDays')) { renderCalendar(); renderTimeGrid(); }

/* ================================================================
   5. REGISTRO — ROLE TOGGLE
   ================================================================ */
function setRole(role) {
  document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById(role === 'alumno' ? 'rolAlumno' : 'rolProfesor');
  if (btn) btn.classList.add('active');
}

/* ================================================================
   6. REVIEWS — STAR RATING
   ================================================================ */
let currentRating = 0;

function initStarRating() {
  const stars = document.querySelectorAll('.star-icon');
  if (!stars.length) return;

  stars.forEach(star => {
    star.addEventListener('mouseover', () => highlightStars(parseInt(star.dataset.value)));
    star.addEventListener('mouseout', () => highlightStars(currentRating));
    star.addEventListener('click', () => {
      currentRating = parseInt(star.dataset.value);
      highlightStars(currentRating);
    });
  });
}

function highlightStars(n) {
  document.querySelectorAll('.star-icon').forEach((s, i) => {
    s.classList.toggle('filled', i < n);
    s.className = i < n
      ? 'bi bi-star-fill star-icon filled'
      : 'bi bi-star star-icon';
  });
}

if (document.getElementById('starRating')) initStarRating();

/* ================================================================
   7. DASHBOARD — AVAILABILITY (dashboard.html)
   ================================================================ */
let availability = {
  Lunes:     [{ from: '09:00', to: '12:00' }, { from: '14:00', to: '18:00' }],
  Martes:    [],
  Miércoles: [{ from: '10:00', to: '13:00' }],
  Jueves:    [],
  Viernes:   [{ from: '15:00', to: '19:00' }],
  Sábado:    [],
  Domingo:   []
};

function renderAvailability() {
  const container = document.getElementById('availabilityContainer');
  if (!container) return;

  container.innerHTML = '';
  Object.entries(availability).forEach(([day, slots]) => {
    const badge = slots.length
      ? `<span class="day-badge">${slots.length} horario${slots.length > 1 ? 's' : ''}</span>`
      : '';

    const content = slots.length
      ? slots.map((s, i) => `
          <div class="slot-row">
            <span>${s.from} – ${s.to}</span>
            <button class="btn-del" onclick="deleteSlot('${day}', ${i})">
              <i class="bi bi-trash3-fill"></i>
            </button>
          </div>`).join('')
      : `<p class="no-avail">Sin disponibilidad</p>`;

    container.innerHTML += `
      <div class="day-card">
        <div class="day-card-head">
          <span class="day-name">${day}</span>${badge}
        </div>
        ${content}
      </div>`;
  });
}

function deleteSlot(day, idx) {
  availability[day].splice(idx, 1);
  renderAvailability();
  guardarHorariosEnSupabase();
}

function addHorario() {
  const day  = document.getElementById('addDay')?.value;
  const from = document.getElementById('addFrom')?.value;
  const to   = document.getElementById('addTo')?.value;

  if (!from || !to || from >= to) {
    alert('La hora de inicio debe ser anterior a la hora de fin.');
    return;
  }
  if (!availability[day]) availability[day] = [];
  availability[day].push({ from, to });
  availability[day].sort((a, b) => a.from.localeCompare(b.from));
  renderAvailability();

  const modal = bootstrap.Modal.getInstance(document.getElementById('modalHorario'));
  if (modal) modal.hide();

  guardarHorariosEnSupabase();
}

/* ── Auto-guardar horarios en Supabase al agregar/eliminar ── */
async function guardarHorariosEnSupabase() {
  try {
    const usuarioRaw = localStorage.getItem('tutores_usuario');
    if (!usuarioRaw) return;
    const usuario = JSON.parse(usuarioRaw);
    if (!usuario.id) return;

    const SUPABASE_URL = 'https://dzrgyxqzacnhqbkkdskj.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_YmqZU6pgjkLVCLZONTKD2Q_9rfcSAgP';

    // Actualizar localStorage también
    const perfil = JSON.parse(localStorage.getItem('tutores_perfil_profesor') || '{}');
    perfil.horarios = availability;
    localStorage.setItem('tutores_perfil_profesor', JSON.stringify(perfil));

    // Verificar si existe el perfil
    const checkRes = await fetch(
      `${SUPABASE_URL}/rest/v1/perfiles_profesores?usuario_id=eq.${usuario.id}&select=id`,
      { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
    );
    const checkData = await checkRes.json();
    const existe = Array.isArray(checkData) && checkData.length > 0;

    const payload = { horarios: JSON.stringify(availability) };

    if (existe) {
      await fetch(
        `${SUPABASE_URL}/rest/v1/perfiles_profesores?usuario_id=eq.${usuario.id}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(payload)
        }
      );
    }
    // Si no existe el perfil aún, no hacemos INSERT aquí (lo hace el registro/guardarPerfilPublico)
  } catch(e) {
    console.warn('No se pudo sincronizar horario con Supabase:', e);
  }
}

function showSection(name, el) {
  document.querySelectorAll('[id^="section-"]').forEach(s => s.classList.add('d-none'));
  document.getElementById('section-' + name)?.classList.remove('d-none');
  document.querySelectorAll('.sidebar-menu a').forEach(a => a.classList.remove('active'));
  if (el) el.classList.add('active');
  return false;
}

if (document.getElementById('availabilityContainer')) {
  (async function cargarHorariosIniciales() {
    try {
      const usuarioRaw = localStorage.getItem('tutores_usuario');
      if (!usuarioRaw) { renderAvailability(); return; }
      const usuario = JSON.parse(usuarioRaw);
      if (!usuario.id) { renderAvailability(); return; }
      const SUPABASE_URL = 'https://dzrgyxqzacnhqbkkdskj.supabase.co';
      const SUPABASE_KEY = 'sb_publishable_YmqZU6pgjkLVCLZONTKD2Q_9rfcSAgP';
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/perfiles_profesores?usuario_id=eq.${usuario.id}&select=horarios`,
        { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
      );
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0 && data[0].horarios) {
        const horariosDB = JSON.parse(data[0].horarios);
        Object.keys(availability).forEach(dia => { if (horariosDB[dia] !== undefined) availability[dia] = horariosDB[dia]; });
        Object.keys(horariosDB).forEach(dia => { if (!availability[dia]) availability[dia] = horariosDB[dia]; });
      }
    } catch(e) { console.warn('Usando horarios locales'); }
    renderAvailability();
  })();
}

/* ================================================================
   8. VIDEOLLAMADA (videollamada.html)
   ================================================================ */
function initVideoCall() {
  const timerEl = document.getElementById('sessionTimer');
  if (!timerEl) return;

  let seconds = 45 * 60 + 32;
  const interval = setInterval(() => {
    seconds++;
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    timerEl.textContent = `${m}:${s}`;
  }, 1000);

  // Mic / Camera toggles
  document.getElementById('micBtn')?.addEventListener('click', function () {
    this.classList.toggle('active');
    const icon = this.querySelector('i');
    icon.className = this.classList.contains('active') ? 'bi bi-mic-mute' : 'bi bi-mic';
  });
  document.getElementById('camBtn')?.addEventListener('click', function () {
    this.classList.toggle('active');
    const icon = this.querySelector('i');
    icon.className = this.classList.contains('active') ? 'bi bi-camera-video-off' : 'bi bi-camera-video';
  });
}

function sendMessage() {
  const input = document.getElementById('chatInput');
  const messages = document.getElementById('chatMessages');
  if (!input || !messages) return;

  const text = input.value.trim();
  if (!text) return;

  const now = new Date();
  const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;

  const msgDiv = document.createElement('div');
  msgDiv.className = 'chat-msg text-end';
  msgDiv.innerHTML = `
    <span class="chat-sender">Tú · ${time}</span>
    <div class="msg-bubble msg-right">${text}</div>`;
  messages.appendChild(msgDiv);
  messages.scrollTop = messages.scrollHeight;
  input.value = '';
}

// Send on Enter key
document.getElementById('chatInput')?.addEventListener('keydown', e => {
  if (e.key === 'Enter') sendMessage();
});

function endCall() {
  if (confirm('¿Seguro que deseas finalizar la sesión?')) {
    alert('La sesión ha finalizado. ¡Gracias por usar Tutores On-Line!');
    window.location.href = 'index.html';
  }
}

if (document.getElementById('sessionTimer')) initVideoCall();

/* ================================================================
   9. GLOBAL — ACTIVE NAV LINK
   ================================================================ */
(function highlightNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.getAttribute('href') === path) link.classList.add('active', 'fw-700');
  });
})();

/* ================================================================
   10. PERFIL TUTOR DINÁMICO (Perfil_tutor.html)
   ================================================================ */
function cargarPerfilTutor() {
  if (!document.querySelector('.profile-name')) return;

  const params   = new URLSearchParams(window.location.search);
  const idParam  = params.get('id') || '';

  // Si el id empieza con "db_" es un profesor registrado en Supabase.
  // El script propio de Perfil_tutor.html lo carga — aquí no hacemos nada.
  if (idParam.startsWith('db_')) return;

  const id    = parseInt(idParam);
  const tutor = tutores.find(t => t.id === id);

  if (!tutor) {
    // Solo mostrar error si había un id numérico pero no coincidió
    if (idParam) {
      document.querySelector('.profile-name')?.closest('.container')?.insertAdjacentHTML(
        'afterbegin', '<div class="alert alert-danger mt-3">Tutor no encontrado.</div>'
      );
    }
    return;
  }

  // Nombre, especialidad, rating
  const el = n => document.querySelector(n);
  if (el('.profile-name'))      el('.profile-name').textContent      = tutor.name;
  if (el('.profile-specialty')) el('.profile-specialty').textContent = tutor.specialty;
  if (el('.booking-price'))     el('.booking-price').innerHTML       = `$${tutor.price.toLocaleString()} <span>por hora</span>`;

  // Rating
  const ratingEl = document.querySelector('.fw-600.text-warning, .fw-600');
  if (ratingEl && ratingEl.textContent.match(/^\d/)) ratingEl.textContent = tutor.rating;

  // Avatar
  const avatar = document.querySelector('.profile-avatar');
  if (avatar) { avatar.src = tutor.avatar; avatar.alt = tutor.name; }

  // Título de la página
  document.title = `${tutor.name} | Tutores On-Line`;

  // Enlace reservar — pasar tutor id
  const btnReservar = document.querySelector('a[href="reserva.html"]');
  if (btnReservar) btnReservar.href = `reserva.html?tutor=${tutor.id}`;

  // Materias desde especialidad
  const tagsContainer = document.querySelector('.subject-tag')?.parentElement;
  if (tagsContainer) {
    const materias = tutor.specialty.split(/[,y&]+/).map(m => m.trim()).filter(Boolean);
    tagsContainer.innerHTML = materias.map(m => `<span class="subject-tag">${m}</span>`).join('');
  }
}

if (document.querySelector('.profile-name')) cargarPerfilTutor();

/* ================================================================
   11. HERO SEARCH — BÚSQUEDA DESDE LA LANDING
   ================================================================ */
function heroSearch() {
  const input = document.getElementById('heroSearchInput');
  const query = input ? input.value.trim() : '';
  const url = 'pages/Buscar_tutor.html' + (query ? '?q=' + encodeURIComponent(query) : '');
  window.location.href = url;
}

// También buscar al presionar Enter en el input del hero
document.getElementById('heroSearchInput')?.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') heroSearch();
});

/* ================================================================
   12. RENDER HELPERS — usados por Buscar_tutor.html si los necesita
   ================================================================ */
// La carga real de profesores desde Supabase la hace Buscar_tutor.html
// con su propio script inline. app.js no vuelve a tocar tutoresGrid.
