
import { invoke } from "@tauri-apps/api";
import { ejecutarFuncionAlCargarDoc, eventoVentanaCargada } from "./utils";
import { traduccion_stats } from "./assets/iconos";

interface datosEvento {
    datosPokemon: Pokemon;
}

let pokemon1: Pokemon;

eventoVentanaCargada((evento) => {
    pokemon1 = (evento.payload as datosEvento).datosPokemon;

    ejecutarFuncionAlCargarDoc(document, () => domCargado());
})

function domCargado() {
    mostrarEstadisticas(pokemon1);
    return;
    let cuadro_busqueda = document.getElementById("cuadro_busqueda")! as HTMLInputElement;
    cuadro_busqueda.placeholder = "Introduce el nombre o el id para comparar. Pulsa \u{21B5} para buscar";

    document.querySelector<HTMLButtonElement>("#boton_busqueda")?.addEventListener("click", () => {
        cuadro_busqueda?.dispatchEvent(new KeyboardEvent("keypress", { key: "Enter" }));
    })

    cuadro_busqueda?.addEventListener("keyup", function () {
        this.value = this.value.toLowerCase();
    });

    cuadro_busqueda?.addEventListener("keypress", function (evento) {
        if (evento.key == "Enter") {
                
        }
    })
}

function mostrarEstadisticas(pokemon:Pokemon) {
    
    let total = 0;
    let desviacion = 0;
    let media = 0;
    
    pokemon.stats.forEach((val) => {
        total += val.base_stat;
    });
    
    media = total / pokemon.stats.length;
    
    pokemon.stats.forEach( val => {
        desviacion += Math.pow(val.base_stat - media, 2);
    });
    
    desviacion = Math.sqrt(desviacion / pokemon.stats.length);
    if(!document.getElementById(pokemon.id.toString())){
        fichaPokemon(pokemon, [total, media, desviacion]);
    }
}

async function fichaPokemon(pokemon: Pokemon, estadisticas: [number, number, number]) {
    let main = document.querySelector<HTMLElement>("main")!;
    let seccion_pokemon = document.createElement("section");
    main.appendChild(seccion_pokemon);

    seccion_pokemon.style.marginTop = "15px";
    seccion_pokemon.id = pokemon.id.toString();
    let imagen = document.createElement("img")
    seccion_pokemon.appendChild(imagen);

    
    let arrayImagenString = localStorage.getItem("ArrayImagen");

    if (arrayImagenString != null) {
        let arrayImagen = arrayImagenString.split(",").map((val) => Number(val));

        await crearImagen(arrayImagen, imagen);
    }

    let seccion_estadistica = document.createElement("section");
    seccion_pokemon.appendChild(seccion_estadistica);
    seccion_estadistica.style.display = "flex";
    seccion_estadistica.style.marginTop = "10px";

    pokemon.stats.forEach((val) => {
        anyadirEstadistica(seccion_estadistica, val);
    });

    let estadisticas_generales = document.createElement("section");
    seccion_pokemon.appendChild(estadisticas_generales);

    let estadisticas_nombre = ["Total", "MEDIA", "\u{03C3}"]

    estadisticas.forEach((val, index) => {
        let p = document.createElement("p");
        estadisticas_generales.appendChild(p);
        p.innerText = `${estadisticas_nombre[index]}: ${val.toFixed(2)}`;
    })
}

function anyadirEstadistica(elementoContenedor: HTMLElement, estadistica: PokemonStat) {
    let stElement = document.createElement("section");
    elementoContenedor.appendChild(stElement);

    let stValor = document.createElement("section");
    let stPorcentaje = document.createElement("section")
    let stTitulo = document.createElement("section");
    stElement.appendChild(stValor);
    stElement.appendChild(stPorcentaje);
    stElement.appendChild(stTitulo);

    stElement.classList.add("estadistica");
    stPorcentaje.classList.add("barra_estadistica");

    let stSpan = document.createElement("span");
    stPorcentaje.appendChild(stSpan);

    let porcentajeAltura = (estadistica.base_stat * 100 / 255);
    stSpan.style.height =  porcentajeAltura + "%";
    stSpan.style.top = (100 - porcentajeAltura)  + "%";
    stValor.innerText = estadistica.base_stat.toString();
    stTitulo.innerText = traduccion_stats[estadistica.stat.name];

} 

async function crearImagen(arrayImagen: number[], imagen: HTMLImageElement) {
    let datosImagen = Int8Array.from(await invoke("redimensionar_imagen", { imagen: arrayImagen, ancho: 200, alto: 200 }) as number[]);
    imagen.src = URL.createObjectURL(new Blob([datosImagen.buffer], { type: "image/png" }));
}


// TODO Modularizar la busqueda
// async function buscarPokemon(pokemon: string) {
//     fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemon}`)
//     .then(data => {
//       if (data.status != 200) {
//         let razon: string;
//         let mostrarRazon: boolean = false;
//         switch (data.status) {
//           case 404:
//             razon = "Nombre de pokemon o ID incorrecto";
//             mostrarRazon = true;
//             break;
//           default:
//             razon = `Error ${data.status}. ${data.statusText}`;
//             break;
//         }
//         return Promise.reject({mostrarRazon, razon});
//       }
//       return data.json() as Promise<PokemonSpecies>;
//     })
//     .then((datosEspecies) => {
//       especiePokemon = datosEspecies;
//       //Busca el valor por defecto de una especie, aunque no deberia deberia de haber al menos 1 a true, en caso contrario, devuelve el primer valor
//       let pokemon = (datosEspecies.varieties.find(val => val.is_default) || datosEspecies.varieties[0]).pokemon;
//       fetchData<typeof pokemon.type>(pokemon.url).then(datos => {
//         let area_imagen = document.querySelector<HTMLDivElement>("#imagenes");
       
//         let cartaPokemon = crearTarjetaPokemon(datos, datosEspecies.flavor_text_entries);
//         area_imagen?.appendChild(cartaPokemon);
//       });
//     })
//     .catch((e: {mostrarRazon: boolean, razon: string}) => {
//         let {mostrarRazon, razon} = e;
//         error(`Error al buscar: ${razon}`);
//         if(mostrarRazon) {
//           mostrarInfo(razon);
//         }
//     });
// }