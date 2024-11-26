
import { invoke } from "@tauri-apps/api";
import { ejecutarFuncionAlCargarDoc, eventoVentanaCargada, fetchData } from "./utils";
import { abreviaturas_stats, tipos_pokemon, traduccion_stats, traduccion_tipos } from "./assets/iconos";
import { mapaDebilidades, objetoDebilidades } from "./interfaces/tipos";

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
    

    let seccionPokemon = document.createElement("section");
    
    seccionPokemon.classList.add("seccionPokemon");
    seccionPokemon.id = pokemon.id.toString();
    
    let imagen = document.createElement("img")
    let seccionTipos = document.createElement("section");
    let seccionGeneral = document.createElement("section");
    seccionPokemon.appendChild(seccionGeneral);
    
    seccionGeneral.appendChild(imagen);
    seccionGeneral.appendChild(seccionTipos);
    
    let arrayImagenString = localStorage.getItem("ArrayImagen");

    if (arrayImagenString != null) {
        let arrayImagen = arrayImagenString.split(",").map((val) => Number(val));

        await crearImagen(arrayImagen, imagen);
    }

    let seccionEstadistica = document.createElement("section");
    seccionPokemon.appendChild(seccionEstadistica);
    seccionEstadistica.style.display = "flex";
    seccionEstadistica.style.marginTop = "10px";

    pokemon.stats.forEach((val) => {
        anyadirEstadistica(seccionEstadistica, val);
    });

    let stGenerales = document.createElement("section");
    seccionPokemon.appendChild(stGenerales);
    stGenerales.classList.add("stGenerales");

    let estadisticasNombre = ["Total", "Media", "\u{03C3}"];

    estadisticas.forEach((val, index) => {
        let p = document.createElement("p");
        stGenerales.appendChild(p);
        p.innerText = `${estadisticasNombre[index]}: ${val.toFixed(2)}`;
    })

    let debilidades: Array<TypeRelations> = []; 
    
    pokemon.types.forEach(async (tipo) => {
        crearTipo(tipo.type.name, seccionTipos);
    })
    
    debilidades[0] = (await fetchData<Type>(pokemon.types[0].type.url)).damage_relations;

    if(pokemon.types.length == 2 ) {
        debilidades[1] = (await fetchData<Type>(pokemon.types[1].type.url)).damage_relations;
    }

    let seccionResistencias = document.createElement("section");
    seccionPokemon.appendChild(seccionResistencias);
    mostrarDebilidades(debilidades, seccionResistencias);
    
    main.style.gridTemplateColumns = "300px ".repeat(main.childElementCount + 1);
    main.appendChild(seccionPokemon);
}

function mostrarDebilidades(debilidades: TypeRelations[], seccionResistencias: HTMLElement) {
    let debilidadesMap = calcularDebilidades(debilidades);
    console.log(debilidadesMap);
    let clasesDebilidades: Record<number, string> = {
        4: "superEfectivo",
        2: "efectivo",
        1: "normal",
        0.5: "resistente",
        0.25: "superResistente",
        0: "inume"
    }

    for (const [clave, valores] of debilidadesMap.entries()) {
        seccionResistencias.appendChild(crearSeccionResistencias(clasesDebilidades[clave], valores));
    }
    
}

function crearSeccionResistencias(clase: string, valores: string[] ): HTMLElement {
    let element = document.createElement("section");
    element.classList.add(clase);

    valores.forEach(val => {
        crearTipo(val, element);
    })

    return element;
}

function calcularDebilidades(debilidades: TypeRelations[]): Map<number, string[]> {
    let  objectToMap = (debilidad: TypeRelations, mapaDebilidad: mapaDebilidades) => {
        debilidad.double_damage_from.map((val) => {
            mapaDebilidad.set(val.name, 2);
        });

        debilidad.half_damage_from.map((val) => {
            mapaDebilidad.set(val.name, 0.5);
        });

        debilidad.no_damage_from.map((val) => {
            mapaDebilidad.set(val.name, 0);
        });
    }

    let calcularFactor= (mapaDeb1: mapaDebilidades, mapaDeb2: mapaDebilidades, mapaFactores: mapaDebilidades) => {
        mapaDeb1.forEach((factor, tipo) => {
            let factor2 = mapaDeb2.get(tipo) || 1;

            mapaFactores.set(tipo, factor * factor2);
        })
    }

    let debilidadesFinal: mapaDebilidades = new Map();
    let tipos = Object.keys(tipos_pokemon);

    //https://github.com/yashrajbharti/Pokemon-Type-Weakness-Calculator/blob/main/script.js
    if(debilidades.length == 2) {
        let deb1 = debilidades[0];
        let deb2 = debilidades[1];

        let mapDeb1:mapaDebilidades = new Map();
        let mapDeb2:mapaDebilidades = new Map();

        objectToMap(deb1, mapDeb1);
        objectToMap(deb2, mapDeb2);

        calcularFactor(mapDeb1, mapDeb2, debilidadesFinal);
        calcularFactor(mapDeb2, mapDeb1, debilidadesFinal);

    } else {
        let deb1 = debilidades[0];
       objectToMap(deb1, debilidadesFinal);
    }

    tipos.forEach((val) => {
        if(!debilidadesFinal.has(val)){
            debilidadesFinal.set(val, 1);
        }
    })

    let debilidadesAgrupadas = new Map<number, string[]>()

    debilidadesFinal.forEach((val, key) => {
        let array = debilidadesAgrupadas.get(val) || [];
        array.push(key);
        debilidadesAgrupadas.set(val, array);
    })

    return debilidadesAgrupadas;
}

//En un futuro se modularizara esta funcion, es una solucion temporal
function crearTipo(nombre_tipo: string, seccion_tipos: HTMLElement) {
    let div_tipo = document.createElement("div");
    let imagen_tipo = new Image(30, 30);
    let texto_tipo = document.createElement("span");
  
    seccion_tipos.appendChild(div_tipo).appendChild(imagen_tipo);
  
    imagen_tipo.src = tipos_pokemon[nombre_tipo];
    imagen_tipo.alt = `Tipo ${traduccion_tipos[nombre_tipo]}`;
  
    div_tipo.classList.add(nombre_tipo, "tipo");
    texto_tipo.innerText = traduccion_tipos[nombre_tipo];
  
    div_tipo.appendChild(texto_tipo);
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
    stValor.classList.add("valor")
    stTitulo.classList.add("stTitulo")

    stElement.classList.add("estadistica");
    stPorcentaje.classList.add("barra_estadistica");

    let stSpan = document.createElement("span");
    stPorcentaje.appendChild(stSpan);

    let porcentajeAltura = (estadistica.base_stat * 100 / 255);
    stSpan.style.height =  porcentajeAltura + "%";
    stSpan.style.top = (100 - porcentajeAltura)  + "%";
    stValor.innerText = estadistica.base_stat.toString();
    stTitulo.innerText = abreviaturas_stats[estadistica.stat.name];
    stTitulo.title = traduccion_stats[estadistica.stat.name];

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