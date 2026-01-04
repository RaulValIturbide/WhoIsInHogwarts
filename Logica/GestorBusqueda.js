class GestorBusqueda {
    constructor(listaPersonajes,traducciones) {
        this.listaPersonajes = listaPersonajes;
        this.traducciones = traducciones;
        this.personajeSecreto = null;
        this.buscador = document.querySelector(".buscador");
        this.resultados = document.querySelector(".resultados");

        this.buscador.addEventListener("input", () => {
            this.mostrarCoincidencias(this.buscador.value);
        });
    }

    mostrarCoincidencias(texto) {
        texto = texto.toLowerCase().trim();
        
        if(texto === ""){
            this.resultados.innerHTML = "";
            return;
        }
        const coincidencias = this.listaPersonajes.filter(p =>
            p.nombre.toLowerCase().includes(texto)
        );

        this.pintarResultadoCoincidencias(coincidencias);
    }

pintarResultadoCoincidencias(lista) {
    this.resultados.innerHTML = "";

    lista.forEach(p => {
        const div = document.createElement("div");
        div.classList.add("itemResultado");

        const img = document.createElement("img");
        img.src = p.rutaImagenIcon;
        img.classList.add("imgResultado");

        const nombre = document.createElement("span");
        nombre.textContent = p.nombre;

        // Listener correcto
        div.addEventListener("click", () => {
            this.pintarResultadoJugador(p, this.personajeSecreto);
            this.buscador.value="";
            this.resultados.innerHTML = "";
        });

        div.appendChild(img);
        div.appendChild(nombre);

        this.resultados.appendChild(div);
    });
}

pintarResultadoJugador(personajeElegido, personajeSecreto) { 
    const contenedor = document.querySelector(".scrollResultados"); 
    contenedor.insertAdjacentHTML("afterbegin", ` <div class="intentoFila"> <img src="${personajeElegido.rutaImagenIcon}" class="imgIntento"> 
        ${this.comparar(this.traducciones.attributes.house, personajeElegido.casa, personajeSecreto.casa)} 
        ${this.comparar(this.traducciones.attributes.blood, personajeElegido.sangre, personajeSecreto.sangre)}
        ${this.comparar(this.traducciones.attributes.gender, personajeElegido.genero, personajeSecreto.genero)}
        ${this.comparar(this.traducciones.attributes.magic, personajeElegido.magico, personajeSecreto.magico)} 
        ${this.comparar(this.traducciones.attributes.species, personajeElegido.especie, personajeSecreto.especie)} 
        ${this.comparar(this.traducciones.attributes.birthday, personajeElegido.nacimiento, personajeSecreto.nacimiento,personajeElegido)} 
        ${this.comparar(this.traducciones.attributes.alignment, personajeElegido.alineamiento, personajeSecreto.alineamiento)} 
        ${this.comparar(this.traducciones.attributes.state, personajeElegido.estado, personajeSecreto.estado)} 
        </div> `); 

        // Efecto de aparición secuencial 
        const primerIntento = contenedor.firstElementChild; 
        const atributos = primerIntento.querySelectorAll(".atributo"); 
        atributos.forEach((attr, i) => { 
            setTimeout(() => { 
                attr.classList.add("visible"); 
                if(i === atributos.length-1){
                    if (personajeElegido === personajeSecreto) { 
                        console.log("Acertaste!!"); 
                        const cromo = document.querySelector(".CromoPersonajeSecreto"); 
                        const img = document.getElementById("imgCromo"); 
                        const caja = cromo.querySelector(".CajaAcierto"); 
                        img.src = personajeElegido.rutaImagenCromo; 
                        caja.textContent = this.traducciones.win_message + personajeSecreto.nombre; 
                        cromo.classList.add("mostrar");
                    }
                }
            }, i * 600)
        });
}

comparar(etiqueta, valorJugador, valorCorrecto,personajeElegido = null) {

    // 1. TRADUCIR BOOLEANOS (vivo / muerto)
    if (etiqueta.value === "estado") {
        valorJugador = valorJugador ? this.traducciones.values.alive : this.traducciones.values.dead;
        valorCorrecto = valorCorrecto ? this.traducciones.values.alive : this.traducciones.values.dead;
    }

    //1.2 TRADUCIR BOOLEANO (magico/no-magico)
    if (etiqueta.value === "magico") { 
        valorJugador = valorJugador ? this.traducciones.values.yes : this.traducciones.values.no; 
        valorCorrecto = valorCorrecto ? this.traducciones.values.yes : this.traducciones.values.no; 
    }

    // 2. TRADUCIR VALORES (male, female, pureblood, etc.)
    if (this.traducciones.values[valorJugador]) {
        valorJugador = this.traducciones.values[valorJugador];
    }
    if (this.traducciones.values[valorCorrecto]) {
        valorCorrecto = this.traducciones.values[valorCorrecto];
    }

    // 3. COMPARACIÓN DE FECHAS (edad)
    if (etiqueta === this.traducciones.attributes.birthday) {

        const fechaJugador = new Date(valorJugador);
        const fechaCorrecto = new Date(valorCorrecto);

        if (!isNaN(fechaJugador) && !isNaN(fechaCorrecto)) {

            if (fechaJugador < fechaCorrecto) {
                valorJugador = this.traducciones.age_compare.older;
            } else if (fechaJugador > fechaCorrecto) {
                valorJugador = this.traducciones.age_compare.younger;
            } else {
                valorJugador = this.traducciones.age_compare.same;
            }

            // Para evitar aciertos falsos
            valorCorrecto = this.traducciones.age_compare.same;
        }else{
            valorJugador = this.traducciones.values.unknown;
        }
    }

    // 4. CLASE CSS 
    
    //let clase = "fallo";

    //if (valorJugador === valorCorrecto && etiqueta != this.traducciones.attributes.birthday) {
    //    clase = "acierto";
    //} 
    
    
    //TODO AQUÍ EN ALGÚN MOMENTO DEBERÍA DE IMPLEMENTAR LAS POSIBILIDADES PARCIALES
     //Prueba Parcialidad 
     let clase = this.PintarEtiquetas(etiqueta,valorJugador,valorCorrecto,personajeElegido);
    // 5. DEVOLVER SOLO EL VALOR 
    return `
        <div class="atributo ${clase}">
            ${valorJugador}
        </div>
    `;
}

    //Metodo para pintar si el jugador acierta (verde), parcial(amarillo) o falla (rojo)
    PintarEtiquetas(etiqueta,valorJugador,valorCorrecto,personajeElegido = null){
        let clase = "parcial";
        
        if(etiqueta == this.traducciones.attributes.birthday){
            if(personajeElegido.nombre == this.personajeSecreto.nombre){
                clase = "acierto";
            }else{
                if(valorCorrecto == this.traducciones.values.unknown){
                    clase = "parcial";
                }else if(personajeElegido.nombre == this.personajeSecreto.nombre){
                    clase = "acierto";
                }
            }   
        }else if (etiqueta == this.traducciones.attributes.alignment){
            
            //Si coincide
            if(valorJugador === valorCorrecto){
                clase = "acierto";
            }else{
            //Si comparte palabra se pone en parcial
            const partesJugador = valorJugador.split("-");
            const partesCorrecto = valorCorrecto.split("-");

            const coincide = partesJugador.some(p => partesCorrecto.includes(p));
            if(coincide){
                clase = "parcial";
            }else{
                clase = "fallo";
            }
            }
        }else{
            if(valorJugador === valorCorrecto){
                clase = "acierto";
            }else{
                clase = "fallo";
            }
        }      
        return clase;
    }


    setPersonajeSecreto(personaje) { 
        this.personajeSecreto = personaje;
        console.log(this.personajeSecreto.nombre);
    }


}
