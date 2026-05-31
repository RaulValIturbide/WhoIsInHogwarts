
// 1. FUNCIONES


async function cargarIdioma(idioma) {
    const res = await fetch(`json/lang/${idioma}.json`);
    traducciones = await res.json();
    window._idiomaActual = idioma;
}

function aplicarTraducciones() {
    document.querySelector(".titulo").textContent = traducciones.title;
    document.querySelector(".buscador").placeholder = traducciones.search_placeholder;

    const encabezado = document.querySelector(".encabezadoTabla");
    encabezado.innerHTML = `
        <div class="celdaHeader"></div>
        <div class="celdaHeader">${traducciones.attributes.house}</div>
        <div class="celdaHeader">${traducciones.attributes.blood}</div>
        <div class="celdaHeader">${traducciones.attributes.gender}</div>
        <div class="celdaHeader">${traducciones.attributes.magic}</div>
        <div class="celdaHeader">${traducciones.attributes.species}</div>
        <div class="celdaHeader">${traducciones.attributes.birthday}</div>
        <div class="celdaHeader">${traducciones.attributes.alignment}</div>
        <div class="celdaHeader">${traducciones.attributes.state}</div>
    `;

    // Traducir modal login/registro
    if (traducciones.modal) {
        const m = traducciones.modal;
        const tabs = document.querySelectorAll(".tab-btn");
        if (tabs[0]) tabs[0].textContent = m.tab_login;
        if (tabs[1]) tabs[1].textContent = m.tab_register;

        const loginH2  = document.querySelector("#tab-login h2");
        const registerH2 = document.querySelector("#tab-register h2");
        if (loginH2)    loginH2.textContent    = m.login_title;
        if (registerH2) registerH2.textContent = m.register_title;

        const labelsLogin = document.querySelectorAll("#tab-login label");
        if (labelsLogin[0]) labelsLogin[0].textContent = m.label_email;
        if (labelsLogin[1]) labelsLogin[1].textContent = m.label_password;

        const labelsReg = document.querySelectorAll("#tab-register label");
        if (labelsReg[0]) labelsReg[0].textContent = m.label_name;
        if (labelsReg[1]) labelsReg[1].textContent = m.label_email;
        if (labelsReg[2]) labelsReg[2].textContent = m.label_password;

        const fLoginEmail = document.querySelector("#form-login input[type='email']");
        const fLoginPass  = document.querySelector("#form-login .input-password");
        const fRegName    = document.querySelector("#form-register input[type='text']");
        const fRegEmail   = document.querySelector("#form-register input[type='email']");
        const fRegPass    = document.querySelector("#form-register .input-password");
        const btnLogin    = document.querySelector("#form-login .btn-primary");
        const btnReg      = document.querySelector("#form-register .btn-primary");

        if (fLoginEmail) fLoginEmail.placeholder = m.placeholder_email;
        if (fLoginPass)  fLoginPass.placeholder  = m.placeholder_password;
        if (fRegName)    fRegName.placeholder     = m.placeholder_name;
        if (fRegEmail)   fRegEmail.placeholder    = m.placeholder_email;
        if (fRegPass)    fRegPass.placeholder     = m.placeholder_password;
        if (btnLogin)    btnLogin.textContent     = m.btn_login;
        if (btnReg)      btnReg.textContent       = m.btn_register;
        if (m.solemne) {
            const textoSolemne = document.getElementById("texto-solemne");
            if (textoSolemne) textoSolemne.textContent = m.solemne;
        }
        window._tradModal = m;
        const _popupTexto = document.getElementById("popup-info-texto");
        if (_popupTexto) _popupTexto.textContent = traducciones.how_to_play || "";

        // Actualizar label de auth según estado actual
        const btnGoogleText = document.getElementById("btn-google-text");
        if (btnGoogleText) btnGoogleText.textContent = m.btn_google || "Continue with Google";
        const modalDividerText = document.getElementById("modal-divider-text");
        if (modalDividerText) modalDividerText.textContent = m.modal_o || "or";
        const labelAuth = document.getElementById("label-auth");
        if (labelAuth) {
            labelAuth.textContent = window._firebaseUser
                ? (m.label_conectado || "Conectado")
                : (m.label_login || "Inicia sesión");
        }
    }

    // Traducir album
    if (traducciones.album) {
        const tituloAlbum = document.getElementById("album-titulo-texto");
        if (tituloAlbum) tituloAlbum.textContent = traducciones.album.titulo;
        window._tradAlbum = traducciones.album;
    }

    // Traducir cromo ganador si está visible
    const cromoPanel = document.querySelector(".CromoPersonajeSecreto.mostrar");
    if (cromoPanel) {
        const intentosEl = document.getElementById("cromo-intentos");
        if (intentosEl && traducciones.win_intentos) {
            const n = intentosEl.dataset.n || "?";
            intentosEl.textContent = traducciones.win_intentos.replace("{n}", n);
        }
        const msgEl = document.getElementById("cromo-mensaje-coleccion");
        if (msgEl && msgEl.dataset.tipo) {
            const key = msgEl.dataset.tipo === "nuevo" ? "win_nuevo_cromo" : "win_cromo_repetido";
            msgEl.textContent = traducciones[key] || msgEl.textContent;
        }
        const btnAlbum = document.getElementById("btn-ver-album");
        if (btnAlbum && traducciones.win_ver_album) btnAlbum.textContent = traducciones.win_ver_album;
    }
}




// 2. VARIABLES GLOBALES


let gestorPersonaje = new GestorPersonaje();
let listaPersonajes = [];
let traducciones = {};
let gestorBusqueda; // GLOBAL
let gestorIdioma = new GestorIdioma();//TODO PASAR DE app.js a esta clase todo el tema de idiomas


// 3. CARGAR IDIOMA INICIAL

await cargarIdioma(gestorIdioma.DetectarIdioma());
aplicarTraducciones();


// 5. ACTIVAR BOTONES DE IDIOMA (antes del cargarDatos para que funcionen desde el inicio)

document.getElementById("IdiomaSpain").onclick = () => {
    cargarIdioma("es").then(() => {
        aplicarTraducciones();
        if (gestorBusqueda) {
            gestorBusqueda.traducciones = traducciones;
            gestorBusqueda.repintarIntentos();
        }
    });
};

document.getElementById("IdiomaEnglish").onclick = () => {
    cargarIdioma("en").then(() => {
        aplicarTraducciones();
        if (gestorBusqueda) {
            gestorBusqueda.traducciones = traducciones;
            gestorBusqueda.repintarIntentos();
        }
    });
};


// 4. CARGAR PERSONAJES Y CREAR GESTORBUSQUEDA

gestorPersonaje.CargarDatosJSON(listaPersonajes).then(() => {

    // Crear el gestor de búsqueda con el idioma actual
    gestorBusqueda = new GestorBusqueda(listaPersonajes, traducciones);

    // Elegir personaje secreto
    gestorBusqueda.setPersonajeSecreto(gestorPersonaje.PersonajeDeHoy(listaPersonajes));

    // Exponer globalmente para firebase.js
    window._listaPersonajes = listaPersonajes;

   //PRUEBAS
   // gestorBusqueda.setPersonajeSecreto(listaPersonajes[2]);

    // 6. BOTÓN INFO
    const btnInfo    = document.getElementById("btn-info");
    const popupInfo  = document.getElementById("popup-info");
    const popupTexto = document.getElementById("popup-info-texto");
    const popupClose = document.getElementById("popup-info-close");

    btnInfo.onclick = (e) => {
        e.stopPropagation();
        popupTexto.textContent = traducciones.how_to_play || "";
        popupInfo.style.display = popupInfo.style.display === "none" ? "block" : "none";
    };
    popupClose.onclick = () => { popupInfo.style.display = "none"; };
    document.addEventListener("click", (e) => {
        if (!popupInfo.contains(e.target) && e.target !== btnInfo) {
            popupInfo.style.display = "none";
        }
    });

    // 6. BOTÓN DADOS
    document.getElementById("btn-dados").onclick = () => {
        const yaUsados = new Set(gestorBusqueda.historialIntentos.map(p => p.nombre));
        const disponibles = listaPersonajes.filter(p => !yaUsados.has(p.nombre));
        if (!disponibles.length) return;
        const personajeAleatorio = disponibles[Math.floor(Math.random() * disponibles.length)];
        gestorBusqueda.pintarResultadoJugador(personajeAleatorio, gestorBusqueda.personajeSecreto);
    };

    // 7. Exponer gestorBusqueda globalmente para firebase.js (logout reset)
    window._gestorBusqueda = gestorBusqueda;
    window._aplicarTraducciones = aplicarTraducciones;
    window._aplicarTraducciones(); // aplicar idioma actual al exponer la función

});
