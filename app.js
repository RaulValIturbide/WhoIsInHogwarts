
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
        tabs[0].textContent = m.tab_login;
        tabs[1].textContent = m.tab_register;

        document.querySelector("#tab-login h2").textContent    = m.login_title;
        document.querySelector("#tab-register h2").textContent = m.register_title;

        const labelsLogin = document.querySelectorAll("#tab-login label");
        labelsLogin[0].textContent = m.label_email;
        labelsLogin[1].textContent = m.label_password;

        const labelsReg = document.querySelectorAll("#tab-register label");
        labelsReg[0].textContent = m.label_name;
        labelsReg[1].textContent = m.label_email;
        labelsReg[2].textContent = m.label_password;

        document.querySelector("#form-login input[type='email']").placeholder       = m.placeholder_email;
        document.querySelector("#form-login input[type='password']").placeholder    = m.placeholder_password;
        document.querySelector("#form-register input[type='text']").placeholder     = m.placeholder_name;
        document.querySelector("#form-register input[type='email']").placeholder    = m.placeholder_email;
        document.querySelector("#form-register input[type='password']").placeholder = m.placeholder_password;

        document.querySelector("#form-login .btn-primary").textContent    = m.btn_login;
        document.querySelector("#form-register .btn-primary").textContent = m.btn_register;
        if (m.solemne) {
            const textoSolemne = document.getElementById("texto-solemne");
            if (textoSolemne) textoSolemne.textContent = m.solemne;
        }
        window._tradModal = m;
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

    // 5. ACTIVAR BOTONES DE IDIOMA 

    document.getElementById("IdiomaSpain").onclick = () => {
        cargarIdioma("es").then(() => {
            aplicarTraducciones();
            gestorBusqueda.traducciones = traducciones;
            gestorBusqueda.repintarIntentos();
        });
    };

    document.getElementById("IdiomaEnglish").onclick = () => {
        cargarIdioma("en").then(() => {
            aplicarTraducciones();
            gestorBusqueda.traducciones = traducciones;
            gestorBusqueda.repintarIntentos();
        });
    };

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

});
