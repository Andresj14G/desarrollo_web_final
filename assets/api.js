/* ============================================================
   TUTORES ON-LINE · api.js  — Supabase edition
   ============================================================ */

const SUPABASE_URL = 'https://dzrgyxqzacnhqbkkdskj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_YmqZU6pgjkLVCLZONTKD2Q_9rfcSAgP';
const PLACEHOLDER_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Ccircle cx='40' cy='40' r='40' fill='%23e0e0e0'/%3E%3Ccircle cx='40' cy='30' r='14' fill='%23bdbdbd'/%3E%3Cellipse cx='40' cy='64' rx='23' ry='16' fill='%23bdbdbd'/%3E%3C/svg%3E";

/* ── Supabase helper ── */
async function supabaseRequest(path, options = {}) {
  const url = `${SUPABASE_URL}/rest/v1${path}`;
  const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': options.prefer !== undefined ? options.prefer : 'return=representation',
    ...options.headers
  };
  const res  = await fetch(url, { ...options, headers });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  return { ok: res.ok, status: res.status, data };
}

/* ── Sesión ── */
function getToken()   { return localStorage.getItem('tutores_token'); }
function getUsuario() {
  const u = localStorage.getItem('tutores_usuario');
  return u ? JSON.parse(u) : null;
}
function guardarSesion(token, usuario) {
  localStorage.setItem('tutores_token', token);
  localStorage.setItem('tutores_usuario', JSON.stringify(usuario));
}
function cerrarSesion() {
  localStorage.removeItem('tutores_token');
  localStorage.removeItem('tutores_usuario');
  localStorage.removeItem('tutores_perfil_profesor');
  localStorage.removeItem('tutores_avatar');
  const enPages = window.location.pathname.includes('/pages/');
  window.location.href = enPages ? 'login.html' : 'pages/login.html';
}
function crearTokenLocal(usuario) {
  const payload = btoa(JSON.stringify({ ...usuario, exp: Date.now() + 7*24*60*60*1000 }));
  return `local.${payload}.unsigned`;
}

/* ── Redirección según rol ── */
function redirigirSegunRol(usuario) {
  if (usuario.rol === 'profesor') {
    window.location.href = 'dashboard.html';
  } else {
    // Los alumnos van a su panel de estudiante
    const enPages = window.location.pathname.includes('/pages/');
    window.location.href = enPages ? 'dashboard_estudiante.html' : 'pages/dashboard_estudiante.html';
  }
}

/* ── Navbar ── */
function actualizarNavbar() {
  const usuario = getUsuario();
  ['ul.navbar-nav', 'ul.dash-nav-links', '[data-auth-area]'].forEach(sel => {
    document.querySelectorAll(sel).forEach(nav => {
      if (!nav) return;
      if (usuario) {
        nav.querySelectorAll('li').forEach(li => {
          const a = li.querySelector('a');
          if (!a) return;
          const href = (a.getAttribute('href') || '').toLowerCase();
          const txt  = a.textContent.trim().toLowerCase();
          // Quitar login/registro siempre
          if (href.includes('login') || href.includes('registro') ||
              txt.includes('iniciar') || txt.includes('registr')) { li.remove(); return; }
          // Si es profesor, quitar "Buscar profesor"
          if (usuario.rol === 'profesor' &&
              (href.includes('buscar_tutor') || txt.includes('buscar'))) { li.remove(); return; }
        });
        if (!nav.querySelector('.nav-saludo')) {
          const enPages = window.location.pathname.includes('/pages/');
          const s = document.createElement('li');
          s.className = 'nav-item nav-saludo';
          s.innerHTML = `<span style="padding:6px 12px;font-weight:500;">👋 Hola, ${usuario.nombre.split(' ')[0]}</span>`;
          nav.appendChild(s);
          if (usuario.rol === 'profesor') {
            // Botón Mi perfil → lleva al dashboard del tutor sección miperfil
            const p = document.createElement('li');
            p.className = 'nav-item';
            const perfilUrl = enPages ? 'dashboard.html#miperfil' : 'pages/dashboard.html#miperfil';
            p.innerHTML = `<a href="${perfilUrl}" class="btn btn-outline-success rounded-pill px-3">Mi perfil</a>`;
            nav.appendChild(p);
          } else {
            // Botón Mi panel para alumnos
            const d = document.createElement('li');
            d.className = 'nav-item';
            const dashUrl = enPages ? 'dashboard_estudiante.html' : 'pages/dashboard_estudiante.html';
            d.innerHTML = `<a href="${dashUrl}" class="btn btn-outline-success rounded-pill px-3">Mi panel</a>`;
            nav.appendChild(d);
          }
          const b = document.createElement('li');
          b.className = 'nav-item';
          b.innerHTML = `<button onclick="cerrarSesion()" class="btn btn-outline-danger rounded-pill px-3">Cerrar sesión</button>`;
          nav.appendChild(b);
        }
      }
    });
  });
}

/* ── Guardias de ruta ── */
document.addEventListener('DOMContentLoaded', () => {
  const usuario    = getUsuario();
  const path       = window.location.pathname.toLowerCase();
  const esAuth     = path.includes('login') || path.includes('registro');
  const esDashEst  = path.includes('dashboard_estudiante');
  const esDash     = path.includes('dashboard') && !esDashEst;
  const esBuscar   = path.includes('buscar_tutor');
  const esPerfil   = path.includes('perfil_tutor');
  const esReserva  = path.includes('reserva');

  if (usuario && esAuth)     { redirigirSegunRol(usuario); return; }
  if (!usuario && esDash)    { window.location.href = 'login.html'; return; }
  if (!usuario && esDashEst) { window.location.href = 'login.html'; return; }
  if (usuario && usuario.rol === 'profesor' && esDashEst) {
    window.location.href = 'dashboard.html'; return;
  }
  if (usuario && usuario.rol === 'alumno' && esDash) {
    window.location.href = 'dashboard_estudiante.html'; return;
  }
  if (usuario && usuario.rol === 'profesor' && (esBuscar || esPerfil || esReserva)) {
    window.location.href = 'dashboard.html'; return;
  }
  actualizarNavbar();
});

/* ── Mensajes UI ── */
function mostrarError(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.style.cssText = 'display:block;background:#fff3cd;border:1px solid #ffc107;color:#856404;border-radius:8px;padding:10px 14px;margin-bottom:14px;font-size:14px;';
}
function mostrarExito(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.style.cssText = 'display:block;background:#d1e7dd;border:1px solid #198754;color:#0f5132;border-radius:8px;padding:10px 14px;margin-bottom:14px;font-size:14px;';
}
function ocultarMensaje(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'none';
}
function showToast(msg, tipo = 'success') {
  let t = document.getElementById('globalToast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'globalToast';
    t.style.cssText = 'position:fixed;bottom:30px;right:30px;z-index:9999;max-width:340px;padding:16px 20px;border-radius:12px;font-family:Poppins,sans-serif;font-size:14px;line-height:1.5;box-shadow:0 8px 24px rgba(0,0,0,.15);white-space:pre-line;transition:opacity .3s;opacity:0;';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.background = tipo === 'success' ? '#198754' : '#dc3545';
  t.style.color = '#fff';
  t.style.opacity = '1';
  clearTimeout(t._x);
  t._x = setTimeout(() => { t.style.opacity = '0'; }, 4000);
}

/* ============================================================
   REGISTRO
   Guarda usuario en "usuarios" y perfil en "perfiles_profesores"
   ============================================================ */
const formRegistro = document.getElementById('formRegistro');
if (formRegistro) {
  formRegistro.addEventListener('submit', async (e) => {
    e.preventDefault();
    ocultarMensaje('registroMsg');

    const nombre    = document.getElementById('regNombre').value.trim();
    const email     = document.getElementById('regEmail').value.trim();
    const password  = document.getElementById('regPassword').value;
    const telefono  = document.getElementById('regTelefono').value.trim();
    const terminos  = document.getElementById('terminos')?.checked;
    const rol       = (document.querySelector('.role-btn.active')?.dataset.rol) || 'alumno';
    const btn       = formRegistro.querySelector('button[type="submit"]');

    // Datos extra del profesor (funciones expuestas en registro.html)
    const foto        = (typeof window.getFotoBase64 === 'function')      ? window.getFotoBase64()      : null;
    const materias    = (typeof window.getMateriasMarcadas === 'function') ? window.getMateriasMarcadas(): [];
    const precio      = (typeof window.getPrecioHora === 'function')       ? window.getPrecioHora()      : '25000';
    const descripcion = (typeof window.getDescripcion === 'function')      ? window.getDescripcion()     : '';

    if (!nombre || !email || !password) { mostrarError('registroMsg', 'Nombre, correo y contraseña son obligatorios.'); return; }
    if (password.length < 6)            { mostrarError('registroMsg', 'La contraseña debe tener al menos 6 caracteres.'); return; }
    if (!terminos)                       { mostrarError('registroMsg', 'Debes aceptar los términos y condiciones.'); return; }
    if (rol === 'profesor' && materias.length === 0) {
      mostrarError('registroMsg', 'Selecciona al menos una materia que enseñas.'); return;
    }

    btn.disabled = true; btn.textContent = 'Registrando...';

    try {
      // Verificar email duplicado
      const { data: existentes } = await supabaseRequest(
        `/usuarios?email=eq.${encodeURIComponent(email)}&select=id`, { method:'GET', prefer:'' }
      );
      if (Array.isArray(existentes) && existentes.length > 0) {
        mostrarError('registroMsg', 'Ya existe una cuenta con ese correo.'); return;
      }

      // Hash password
      const encoder = new TextEncoder();
      const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(password + 'tutores_salt_2026'));
      const passwordHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2,'0')).join('');

      // Insertar usuario
      const { ok: okUser, data: dataUser } = await supabaseRequest('/usuarios', {
        method: 'POST',
        body: JSON.stringify({ nombre, email, password: passwordHash, telefono: telefono||null, rol })
      });

      if (!okUser) {
        mostrarError('registroMsg', dataUser?.message || dataUser?.[0]?.message || 'Error al registrarse.'); return;
      }

      const usuario = Array.isArray(dataUser) ? dataUser[0] : dataUser;
      const token   = crearTokenLocal(usuario);
      guardarSesion(token, { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol });

      // Si es profesor → guardar perfil en perfiles_profesores
      if (rol === 'profesor') {
        const perfilPayload = {
          usuario_id:  usuario.id,
          nombre:      usuario.nombre,
          email:       usuario.email,
          materias:    materias.join(', '),
          precio:      parseInt(precio) || 25000,
          descripcion: descripcion,
          foto:        foto || '',
          horarios:    JSON.stringify({}),
          rating:      5.0,
          resenas:     0
        };

        await supabaseRequest('/perfiles_profesores', {
          method: 'POST',
          body: JSON.stringify(perfilPayload)
        });

        // Guardar también en localStorage para acceso rápido
        localStorage.setItem('tutores_perfil_profesor', JSON.stringify({
          nombre, materias, precio: parseInt(precio)||25000, descripcion, foto: foto||'', horarios: {}
        }));
        if (foto) localStorage.setItem('tutores_avatar', foto);
      }

      mostrarExito('registroMsg', '¡Cuenta creada! Redirigiendo...');
      setTimeout(() => redirigirSegunRol(usuario), 1000);

    } catch (err) {
      console.error(err);
      mostrarError('registroMsg', 'Error de conexión. Intenta de nuevo.');
    } finally {
      btn.disabled = false; btn.textContent = 'Registrarse';
    }
  });
}

/* ============================================================
   LOGIN — carga perfil del profesor al iniciar sesión
   ============================================================ */
const formLogin = document.getElementById('formLogin');
if (formLogin) {
  formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    ocultarMensaje('loginMsg');

    const email    = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const btn      = formLogin.querySelector('button[type="submit"]');

    if (!email || !password) { mostrarError('loginMsg', 'Completa todos los campos.'); return; }
    btn.disabled = true; btn.textContent = 'Ingresando...';

    try {
      const encoder = new TextEncoder();
      const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(password + 'tutores_salt_2026'));
      const passwordHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2,'0')).join('');

      const { ok, data } = await supabaseRequest(
        `/usuarios?email=eq.${encodeURIComponent(email)}&password=eq.${passwordHash}&select=id,nombre,email,rol`,
        { method:'GET', prefer:'' }
      );

      if (!ok || !Array.isArray(data) || data.length === 0) {
        mostrarError('loginMsg', 'Correo o contraseña incorrectos.'); return;
      }

      const usuario = data[0];
      const token   = crearTokenLocal(usuario);
      guardarSesion(token, usuario);

      // Si es profesor → cargar su perfil desde Supabase y guardarlo en localStorage
      if (usuario.rol === 'profesor') {
        // Limpiar perfil anterior (puede ser de otra cuenta)
        localStorage.removeItem('tutores_perfil_profesor');
        localStorage.removeItem('tutores_avatar');

        try {
          const { ok: okP, data: dataP } = await supabaseRequest(
            `/perfiles_profesores?usuario_id=eq.${usuario.id}&select=*`,
            { method:'GET', prefer:'' }
          );
          if (okP && Array.isArray(dataP) && dataP.length > 0) {
            const d = dataP[0];
            const perfil = {
              nombre:      d.nombre,
              materias:    d.materias ? d.materias.split(',').map(m=>m.trim()).filter(Boolean) : [],
              precio:      parseInt(d.precio)||25000,
              descripcion: d.descripcion||'',
              foto:        d.foto||'',
              horarios:    d.horarios ? JSON.parse(d.horarios) : {}
            };
            localStorage.setItem('tutores_perfil_profesor', JSON.stringify(perfil));
            if (d.foto) {
              localStorage.setItem('tutores_avatar', d.foto);
            }
          }
        } catch(e) { console.warn('No se pudo cargar el perfil del profesor'); }
      }

      mostrarExito('loginMsg', `¡Bienvenido ${usuario.nombre}! Redirigiendo...`);
      setTimeout(() => redirigirSegunRol(usuario), 1000);

    } catch (err) {
      console.error(err);
      mostrarError('loginMsg', 'Error de conexión. Intenta de nuevo.');
    } finally {
      btn.disabled = false; btn.textContent = 'Iniciar sesión';
    }
  });
}

/* ============================================================
   RESERVAS
   ============================================================ */
const btnConfirmar = document.querySelector('.confirm-btn');
if (btnConfirmar) {
  const nb = btnConfirmar.cloneNode(true);
  btnConfirmar.parentNode.replaceChild(nb, btnConfirmar);
  nb.addEventListener('click', async () => {
    if (typeof selectedDate==='undefined'||!selectedDate||typeof selectedTime==='undefined'||!selectedTime||typeof selectedModality==='undefined'||!selectedModality) {
      showToast('Por favor selecciona fecha, hora y modalidad.','error'); return;
    }
    const usuario = getUsuario();
    if (!usuario) { showToast('Debes iniciar sesión para reservar.','error'); setTimeout(()=>{window.location.href='login.html';},1500); return; }

    // tutorParam puede ser "db_123" (Supabase) o "1" (hardcodeado)
    const tutorParam = new URLSearchParams(window.location.search).get('tutor') || '';
    const tutorId = tutorParam.startsWith('db_')
      ? parseInt(tutorParam.replace('db_', ''))   // "db_42" → 42 (usuario_id real)
      : parseInt(tutorParam) || null;              // "3" → 3, vacío → null

    if (!tutorId) {
      showToast('No se pudo identificar al tutor. Vuelve al perfil y vuelve a intentarlo.', 'error');
      return;
    }

    const fechaStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth()+1).padStart(2,'0')}-${String(selectedDate.getDate()).padStart(2,'0')}`;
    const { data: conflicto } = await supabaseRequest(
      `/reservas?tutor_id=eq.${tutorId}&fecha=eq.${fechaStr}&hora=eq.${selectedTime}&estado=neq.cancelada&select=id`,
      { method:'GET', prefer:'' }
    );
    if (Array.isArray(conflicto) && conflicto.length > 0) { showToast('Ese horario ya está reservado. Elige otro.','error'); return; }
    nb.disabled=true; nb.textContent='Confirmando...';
    try {
      const { ok, data } = await supabaseRequest('/reservas', {
        method:'POST',
        body: JSON.stringify({ usuario_id:usuario.id, tutor_id:tutorId, fecha:fechaStr, hora:selectedTime, modalidad:selectedModality })
      });
      if (!ok) { showToast(data?.message||'Error al confirmar.','error'); }
      else {
        const meses=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
        showToast(`✅ Reserva confirmada!\n📅 ${selectedDate.getDate()} de ${meses[selectedDate.getMonth()]} ${selectedDate.getFullYear()}\n⏰ ${selectedTime} · ${selectedModality}`,'success');
      }
    } catch { showToast('Error de conexión.','error'); }
    finally { nb.disabled=false; nb.textContent='Confirmar Reserva'; }
  });
}
