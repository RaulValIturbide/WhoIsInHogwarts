import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
    getFirestore,
    doc,
    setDoc,
    addDoc,
    getDoc,
    collection,
    getDocs,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ── Config ──────────────────────────────────────────────────────────────────
const firebaseConfig = {
    apiKey: "AIzaSyA26_NmsCARHp1JhQA2ukJRtRBABDU2mAU",
    authDomain: "whoisinhogwartstoday.firebaseapp.com",
    projectId: "whoisinhogwartstoday",
    storageBucket: "whoisinhogwartstoday.firebasestorage.app",
    messagingSenderId: "316036109710",
    appId: "1:316036109710:web:0d408652637ca3586c00df",
    measurementId: "G-L52V4GY7WQ"
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

// ── UI helpers ───────────────────────────────────────────────────────────────
const modal       = document.getElementById("Caja_Login");
const camaraIcon  = document.getElementById("AjustesCamaraSecreta");
const camaraWrapper = document.getElementById("btn-camara-wrapper");
const labelAuth   = document.getElementById("label-auth");
const modalInnerOriginal = document.querySelector(".modal-inner").innerHTML;
const errorLogin  = crearMensajeError("form-login");
const errorReg    = crearMensajeError("form-register");

function crearMensajeError(formId) {
    const el = document.createElement("p");
    el.className = "modal-error";
    el.style.cssText = "color:#e57373;font-size:13px;margin-top:10px;text-align:center;display:none;";
    document.getElementById(formId).appendChild(el);
    return el;
}

function mostrarError(el, msg) {
    el.textContent = msg;
    el.style.display = "block";
}
function limpiarError(el) {
    el.style.display = "none";
}

function mostrarExito(nombre) {
    const inner = document.querySelector(".modal-inner");
    inner.innerHTML = `
        <div style="text-align:center;padding:20px 0;">
            <div style="font-size:48px;margin-bottom:16px;">🧙</div>
            <h2 style="color:#d4af37;margin:0 0 10px;">¡Bienvenido, ${nombre}!</h2>
            <p style="color:#b09060;font-size:14px;margin:0;">Tu cuenta ha sido creada con éxito.</p>
        </div>
    `;
    setTimeout(() => {
        modal.classList.remove("open");
        document.querySelector(".modal-inner").innerHTML = modalInnerOriginal;
        reengacharFormularios();
        if (window._aplicarTraducciones) window._aplicarTraducciones();
    }, 2000);
}

function actualizarIcono(user) {
    const t = window._tradModal;
    if (user) {
        camaraIcon.style.filter = "drop-shadow(0 0 8px #4fc3f7)";
        camaraIcon.title = user.displayName || user.email;
        labelAuth.textContent = t?.label_conectado || "Conectado";
    } else {
        camaraIcon.style.filter = "drop-shadow(0 0 5px gold)";
        camaraIcon.title = "";
        labelAuth.textContent = t?.label_login || "Inicia sesión";
    }
}

// ── Auth state ────────────────────────────────────────────────────────────────
onAuthStateChanged(auth, (user) => {
    actualizarIcono(user);
    window._firebaseUser = user || null;
});

// ── Abrir modal según estado de sesión ────────────────────────────────────────
camaraWrapper.addEventListener("click", () => {
    const user = window._firebaseUser;
    if (user) {
        mostrarPerfil(user);
    }
    modal.classList.add("open");
});

document.getElementById("Close_Login").addEventListener("click", () => {
    modal.classList.remove("open");
});

modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.remove("open");
});

// ── Vista de perfil ───────────────────────────────────────────────────────────
function mostrarPerfil(user) {
    document.querySelector(".modal-inner").innerHTML = `
        <button id="Close_Login" aria-label="Cerrar">✕</button>
        <div style="text-align:center;padding:10px 0 20px;">
            <div style="font-size:52px;margin-bottom:12px;">🧙</div>
            <h2 style="color:#d4af37;margin:0 0 6px;font-size:20px;">${user.displayName || "Merodeador"}</h2>
            <p style="color:#9a8060;font-size:13px;margin:0 0 24px;">${user.email}</p>
            <button id="btn-album" style="
                background:linear-gradient(135deg,#5c3a1e,#8a5c2a);
                color:#f5e6c8;border:2px solid #c9a87a;border-radius:8px;
                padding:10px 24px;font-size:14px;font-weight:700;
                cursor:pointer;letter-spacing:1px;margin-bottom:12px;
                display:block;width:100%;transition:opacity 0.2s;">
                ${window._tradAlbum?.btn || "Mi album de cromos"}
            </button>
            <button id="btn-logout" style="
                background:linear-gradient(135deg,#6a1a1a,#b03030);
                color:#fff;border:none;border-radius:8px;
                padding:10px 28px;font-size:14px;font-weight:700;
                cursor:pointer;letter-spacing:1px;width:100%;
                transition:opacity 0.2s;">
                ${window._tradModal?.logout || "Travesura realizada (cerrar sesion)"}
            </button>
        </div>
    `;

    document.getElementById("Close_Login").addEventListener("click", () => {
        modal.classList.remove("open");
    });

    document.getElementById("btn-album").addEventListener("click", () => {
        modal.classList.remove("open");
        abrirAlbum(user);
    });

    document.getElementById("btn-logout").addEventListener("click", async () => {
        await signOut(auth);
        modal.classList.remove("open");
        // Resetear intentos y restaurar el modal para el próximo login
        document.querySelector(".scrollResultados").innerHTML = "";
        if (window._gestorBusqueda) window._gestorBusqueda.historialIntentos = [];
        document.querySelector(".modal-inner").innerHTML = modalInnerOriginal;
        reengacharFormularios();
        if (window._aplicarTraducciones) window._aplicarTraducciones();
    });
}

// ── Enganche de formularios (reutilizable tras restaurar el modal) ────────────
function reengacharFormularios() {
    document.getElementById("form-register").addEventListener("submit", async (e) => {
        e.preventDefault();
        const errEl = e.target.querySelector(".modal-error") || crearMensajeError("form-register");
        limpiarError(errEl);

        const nombre = e.target.querySelector('input[type="text"]').value.trim();
        const email  = e.target.querySelector('input[type="email"]').value.trim();
        const pass   = e.target.querySelector('.input-password').value;

        try {
            const { user } = await createUserWithEmailAndPassword(auth, email, pass);
            await updateProfile(user, { displayName: nombre });
            await setDoc(doc(db, "users", user.uid), {
                nombre, email, creadoEn: serverTimestamp(), partidasJugadas: 0
            });
            e.target.reset();
            mostrarExito(nombre);
        } catch (err) {
            mostrarError(errEl, traducirError(err.code));
        }
    });

    document.getElementById("form-login").addEventListener("submit", async (e) => {
        e.preventDefault();
        const errEl = e.target.querySelector(".modal-error") || crearMensajeError("form-login");
        limpiarError(errEl);

        const email = e.target.querySelector('input[type="email"]').value.trim();
        const pass  = e.target.querySelector('.input-password').value;

        try {
            await signInWithEmailAndPassword(auth, email, pass);
            modal.classList.remove("open");
            e.target.reset();
        } catch (err) {
            mostrarError(errEl, traducirError(err.code));
        }
    });

    // Ojos de contraseña
    document.querySelectorAll(".btn-ojo").forEach(btn => {
        btn.addEventListener("click", () => {
            const input = btn.previousElementSibling;
            const visible = input.type === "text";
            input.type = visible ? "password" : "text";
            btn.textContent = visible ? "👁" : "🙈";
        });
    });

    // Tabs
    document.querySelectorAll(".tab-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
            document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
            btn.classList.add("active");
            document.getElementById("tab-" + btn.dataset.tab).classList.add("active");
        });
    });

    // Botón cerrar
    document.getElementById("Close_Login").addEventListener("click", () => {
        modal.classList.remove("open");
    });
}

// Primera carga
reengacharFormularios();

// ── Guardar personaje adivinado ───────────────────────────────────────────────
// GestorBusqueda.js llama a esta función global cuando el jugador acierta
window.guardarPersonajeAdivinado = async function(personaje, intentos, traducciones) {
    const msgEl = document.getElementById("cromo-mensaje-coleccion");

    const t = window._tradAlbum || {};
    const mostrarMensaje = (texto, color) => {
        if (!msgEl) return;
        msgEl.textContent = texto;
        msgEl.style.cssText = `color:${color};background:rgba(0,0,0,0.3);font-size:12px;font-family:Georgia,serif;text-align:center;margin-top:8px;padding:6px 10px;border-radius:6px;font-style:italic;`;
    };

    const mostrarBtnAlbum = (user) => {
        const btn = document.getElementById("btn-ver-album");
        if (!btn) return;
        btn.textContent = traducciones?.win_ver_album || "Ver mi album";
        btn.style.display = "block";
        btn.onclick = () => {
            document.querySelector(".CromoPersonajeSecreto").classList.remove("mostrar");
            abrirAlbum(user);
        };
    };

    const user = window._firebaseUser;
    if (!user) return;

    const docRef = doc(db, "users", user.uid, "personajesAdivinados", personaje.nombre);

    try {
        const snap = await getDoc(docRef);
        if (snap.exists()) {
            mostrarMensaje(traducciones?.win_cromo_repetido || "¡Ya tenias este cromo!", "#c9a84c");
            if (msgEl) msgEl.dataset.tipo = "repetido";
            mostrarBtnAlbum(user);
            return;
        }
        await setDoc(docRef, {
            nombre:   personaje.nombre,
            imagen:   personaje.rutaImagenCromo || null,
            intentos: intentos,
            fecha:    serverTimestamp()
        });
        mostrarMensaje(traducciones?.win_nuevo_cromo || "¡Nuevo cromo conseguido!", "#7ecf7e");
        if (msgEl) msgEl.dataset.tipo = "nuevo";
        mostrarBtnAlbum(user);
    } catch (err) {
        console.error("Error guardando personaje:", err);
    }
};

// ── Álbum de cromos ───────────────────────────────────────────────────────────
const SLOTS_POR_PAGINA = 9; // 3 cols x 3 filas por página física

async function abrirAlbum(user) {
    const overlay = document.getElementById("album-overlay");
    const gridIzq = document.getElementById("album-cromos-izq");
    const gridDer = document.getElementById("album-cromos-der");
    gridIzq.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:#9a7040;padding:20px;font-family:Georgia,serif;">Cargando...</p>`;
    gridDer.innerHTML = "";
    overlay.classList.add("open");

    let paginaActual = 0;
    let conseguidos = new Map();

    try {
        const snap = await getDocs(collection(db, "users", user.uid, "personajesAdivinados"));
        snap.forEach(docSnap => {
            const d = docSnap.data();
            if (d.nombre && !conseguidos.has(d.nombre)) conseguidos.set(d.nombre, d);
        });
    } catch (err) {
        gridIzq.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:#9a7040;padding:20px;font-family:Georgia,serif;">Error cargando el album.</p>`;
        console.error(err);
    }

    const todosPersonajes = window._listaPersonajes || [];
    const totalPaginas = Math.ceil(todosPersonajes.length / (SLOTS_POR_PAGINA * 2));

    function renderPagina(pagina) {
        const inicio = pagina * SLOTS_POR_PAGINA * 2;
        const slotIzq = todosPersonajes.slice(inicio, inicio + SLOTS_POR_PAGINA);
        const slotDer = todosPersonajes.slice(inicio + SLOTS_POR_PAGINA, inicio + SLOTS_POR_PAGINA * 2);

        const renderGrid = (grid, slots) => {
            grid.innerHTML = "";
            // Rellenar siempre 9 slots aunque no haya personajes
            for (let i = 0; i < SLOTS_POR_PAGINA; i++) {
                const personaje = slots[i];
                const el = document.createElement("div");
                if (!personaje) {
                    // Slot vacío (para mantener el grid 3x3)
                    el.className = "album-cromo-placeholder";
                    el.style.opacity = "0";
                    el.style.pointerEvents = "none";
                } else {
                    const d = conseguidos.get(personaje.nombre);
                    if (d) {
                        const _t = window._tradAlbum || {};
                        const intentosLabel = d.intentos === 1 ? (_t.intento || "intento") : (_t.intentos || "intentos");
                        const fecha = d.fecha ? formatearFecha(d.fecha.toDate()) : "";
                        el.className = "album-cromo";
                        el.innerHTML = `
                            <img src="${personaje.rutaImagenCromo || 'img/Ajustes_CamaraSecretaSimbolo.png'}" alt="${personaje.nombre}">
                            <div class="album-cromo-nombre">${personaje.nombre}</div>
                            <div class="album-cromo-intentos">${d.intentos} ${intentosLabel}</div>
                            ${fecha ? `<div class="album-cromo-fecha">${fecha}</div>` : ""}
                        `;
                        el.addEventListener("click", () => abrirLightbox(d, intentosLabel));
                    } else {
                        el.className = "album-cromo-placeholder";
                        el.innerHTML = `
                            <div class="album-cromo-interrogante">?</div>
                            <div class="album-cromo-nombre">??? ??????</div>
                        `;
                    }
                }
                grid.appendChild(el);
            }
        };

        renderGrid(gridIzq, slotIzq);
        renderGrid(gridDer, slotDer);

        document.getElementById("album-prev").disabled = pagina === 0;
        document.getElementById("album-next").disabled = pagina >= totalPaginas - 1;
    }

    renderPagina(0);

    document.getElementById("album-prev").onclick = () => { if (paginaActual > 0) renderPagina(--paginaActual); };
    document.getElementById("album-next").onclick = () => { if (paginaActual < totalPaginas - 1) renderPagina(++paginaActual); };

    function cerrarAlbum() { overlay.classList.remove("open"); }
    document.getElementById("album-close").onclick = cerrarAlbum;
    overlay.addEventListener("click", (e) => { if (e.target === overlay) cerrarAlbum(); }, { once: true });
}

// ── Lightbox cromo ────────────────────────────────────────────────────────────
function abrirLightbox(d, intentosLabel) {
    const lb = document.getElementById("cromo-lightbox");

    // Buscar el personaje en la lista para obtener la frase
    const lista = window._listaPersonajes || [];
    const personaje = lista.find(p => p.nombre === d.nombre);
    const idioma = window._idiomaActual || "es";
    const frase   = personaje ? (idioma === "en" ? personaje.frase_en   : personaje.frase_es)   : "";
    const ref     = personaje ? (idioma === "en" ? personaje.frase_en_ref : personaje.frase_es_ref) : "";

    document.getElementById("cromo-lightbox-img").src              = d.imagen || personaje?.rutaImagenCromo || 'img/Ajustes_CamaraSecretaSimbolo.png';
    document.getElementById("cromo-lightbox-nombre").textContent   = d.nombre;
    document.getElementById("cromo-lightbox-intentos").textContent = `${d.intentos} ${intentosLabel}`;
    document.getElementById("cromo-lightbox-fecha").textContent    = d.fecha ? formatearFecha(d.fecha.toDate()) : "";
    document.getElementById("cromo-lightbox-texto").textContent    = frase;
    document.getElementById("cromo-lightbox-referencia").textContent = ref;

    lb.classList.add("open");
    lb.addEventListener("click", () => lb.classList.remove("open"), { once: true });
}

function formatearFecha(date) {
    return date.toLocaleDateString(undefined, { day: "2-digit", month: "2-digit", year: "numeric" });
}

// ── Traducción de errores de Firebase ────────────────────────────────────────
function traducirError(code) {
    const errores = {
        "auth/email-already-in-use":    "Este email ya está registrado.",
        "auth/invalid-email":           "Email no válido.",
        "auth/weak-password":           "La contraseña debe tener al menos 6 caracteres.",
        "auth/user-not-found":          "No existe cuenta con ese email.",
        "auth/wrong-password":          "Contraseña incorrecta.",
        "auth/invalid-credential":      "Email o contraseña incorrectos.",
        "auth/too-many-requests":       "Demasiados intentos. Espera un momento.",
    };
    return errores[code] || "Ha ocurrido un error. Inténtalo de nuevo.";
}
