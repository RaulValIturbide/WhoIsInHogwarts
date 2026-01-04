
// 1. FUNCIONES


async function cargarIdioma(idioma) {
    const res = await fetch(`json/lang/${idioma}.json`);
    traducciones = await res.json();
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

   //PRUEBAS
    //gestorBusqueda.setPersonajeSecreto(listaPersonajes[6]);

    // 5. ACTIVAR BOTONES DE IDIOMA 

    document.getElementById("IdiomaSpain").onclick = () => {
        cargarIdioma("es").then(() => {
            aplicarTraducciones();
            gestorBusqueda.traducciones = traducciones; 
        });
    };

    document.getElementById("IdiomaEnglish").onclick = () => {
        cargarIdioma("en").then(() => {
            aplicarTraducciones();
            gestorBusqueda.traducciones = traducciones; 

        });
    };

});
