
import { invoke } from "@tauri-apps/api";
import { arrayFromURL, buscarPokemon, ejecutarFuncionAlCargarDoc, eventoVentanaCargada, fetchData } from "./utils";
import { abreviaturas_stats, tipos_pokemon, traduccion_stats } from "./assets/iconos";
import { mapaDebilidades } from "./interfaces/tipos";
import { CuadroTipo } from "./components/cuadro-tipos";

interface datosEvento {
    datosPokemon: Pokemon;
}

let pokemon1: Pokemon | undefined;
let arrayImagen: number[] | undefined;

let listaPokemon: Array<number> = [];

window.addEventListener("DOMContentLoaded", () => domCargado());

eventoVentanaCargada((evento) => {
    pokemon1 = (evento.payload as datosEvento).datosPokemon;

    ejecutarFuncionAlCargarDoc(document, () => domCargado());
})

function domCargado() {
    let busqueda = document.getElementById("hBusqueda") as HeaderBusqueda;
    if (!busqueda) throw new Error("El cuadro de busqueda deberia de estar creado");

    if (pokemon1) {
        let arrayImagenString = localStorage.getItem("ArrayImagen");

        if (arrayImagenString != null) {
            arrayImagen = arrayImagenString.split(",").map((val) => Number(val));
            localStorage.removeItem("ArrayImagen");
        }

        mostrarDatosPokemon(pokemon1, busqueda);
    } else {
        busqueda.placeholder = "Introduce el nombre/id del pokemon. Pulsa \u{21B5} para buscar";
        busqueda.contenidoBoton = "\u{21B5}";
    }

    busqueda.funcionBusqueda = (el) => {
        buscarPokemon(el.value, function (datosEspecies) {
            let pokemon = (datosEspecies.varieties.find(val => val.is_default) || datosEspecies.varieties[0]).pokemon;

            fetchData<typeof pokemon.type>(pokemon.url).then(datos => {
                mostrarDatosPokemon(datos, busqueda);
            })

            el.value = "";
        })
    }
}

function mostrarDatosPokemon(pokemon: Pokemon, busqueda: HeaderBusqueda) {
    if (!listaPokemon.includes(pokemon.id)) {
        listaPokemon.push(pokemon.id);
        mostrarEstadisticas(pokemon);
    }

    if (listaPokemon.length > 0) {
        busqueda.placeholder = "Pulsa + para añadir un pokemon";
        busqueda.contenidoBoton = "+";
    } else {
        busqueda.placeholder = "Introduce el nombre/id del pokemon. Pulsa \u{21B5} para buscar";
        busqueda.contenidoBoton = "\u{21B5}";
    }
}

function mostrarEstadisticas(pokemon: Pokemon) {
    let total = 0;
    let desviacion = 0;
    let media = 0;

    pokemon.stats.forEach((val) => {
        total += val.base_stat;
    });

    media = total / pokemon.stats.length;

    pokemon.stats.forEach(val => {
        desviacion += Math.pow(val.base_stat - media, 2);
    });

    desviacion = Math.sqrt(desviacion / pokemon.stats.length);
    fichaPokemon(pokemon, [total, media, desviacion]);

}

async function fichaPokemon(pokemon: Pokemon, estadisticas: [number, number, number]) {
    let main = document.querySelector<HTMLElement>("main")!;

    let seccionPokemon = document.createElement("section");
    
    
    seccionPokemon.classList.add("seccionPokemon");
    seccionPokemon.id = pokemon.id.toString();

    let botonEliminar = document.createElement("button");
    botonEliminar.classList.add("btnEliminar");
    botonEliminar.innerText = "X";
    seccionPokemon.appendChild(botonEliminar);

    botonEliminar.onclick =  () => {
        console.log(listaPokemon);
        seccionPokemon.remove();
        listaPokemon.splice(listaPokemon.indexOf(pokemon.id), 1);
        console.log(listaPokemon);
    }

    let imagen = document.createElement("img")
    let seccionTipos = document.createElement("section");
    let seccionGeneral = document.createElement("section");
    seccionPokemon.appendChild(seccionGeneral);

    seccionGeneral.appendChild(imagen);
    seccionGeneral.appendChild(seccionTipos);
    imagen.style.margin = "auto";

    if (arrayImagen == undefined) {
        let arrayImagen = await arrayFromURL(pokemon.sprites.front_default);
        await crearImagen(arrayImagen, imagen);
    }

    let seccionEstadistica = document.createElement("section");
    seccionPokemon.appendChild(seccionEstadistica);
    seccionEstadistica.style.display = "flex";
    seccionEstadistica.style.justifyContent = "center";


    pokemon.stats.forEach((val) => {
        anyadirEstadistica(seccionEstadistica, val, pokemon.types[0].type.name);
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

    let promesasDebilidades: Array<Promise<Type>> = [];
    seccionTipos.classList.add("seccionTipos");

    pokemon.types.forEach(async (tipo, index) => {
        seccionTipos.appendChild(new CuadroTipo(tipo.type.name, true));
        promesasDebilidades[index] = fetchData<Type>(tipo.type.url);
    })

    let debilidades: Array<TypeRelations> = (await Promise.all(promesasDebilidades)).map((val: Type) => {
        return val.damage_relations;
    })

    let seccionResistencias = document.createElement("section");
    seccionPokemon.appendChild(seccionResistencias);
    mostrarDebilidades(debilidades, seccionResistencias);

    main.style.gridTemplateColumns = "300px ".repeat(main.childElementCount + 1);
    main.appendChild(seccionPokemon);
}

function mostrarDebilidades(debilidades: TypeRelations[], seccionResistencias: HTMLElement) {
    let debilidadesMap = calcularDebilidades(debilidades);
    let clasesDebilidades: Record<number, [string, string]> = {
        4: ["secSE", "4x"],
        2: ["secEfec", "2x"],
        1: ["secNor", "1x"],
        0.5: ["secRes", "1/2x"],
        0.25: ["secSR", "1/4x"],
        0: ["secInm", "0x"]
    }

    let sortDeb = Array.from(debilidadesMap.entries()).sort((a, b) => b[0] - a[0]);

    sortDeb.forEach(([clave, valores]) => {
        seccionResistencias.appendChild(crearSeccionResistencias(clasesDebilidades[clave], valores));
    })

}

function crearSeccionResistencias(clase: [string, string], valores: string[]): HTMLElement {
    let element = document.createElement("section");
    let tipos = document.createElement("section");
    let h4 = document.createElement("h4");

    element.classList.add(clase[0], "secDebilidades");
    h4.innerText = `Recibe ${clase[1]} de daño de:`;
    element.appendChild(h4);
    element.appendChild(tipos);

    valores.forEach(val => {
        tipos.appendChild(new CuadroTipo(val, true, true));
    })

    return element;
}

function calcularDebilidades(debilidades: TypeRelations[]): Map<number, string[]> {
    let objectToMap = (debilidad: TypeRelations, mapaDebilidad: mapaDebilidades) => {
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

    let calcularFactor = (mapaDeb1: mapaDebilidades, mapaDeb2: mapaDebilidades, mapaFactores: mapaDebilidades) => {
        mapaDeb1.forEach((factor, tipo) => {
            let factor2 = mapaDeb2.get(tipo) || 1;

            mapaFactores.set(tipo, factor * factor2);
        })
    }

    let debilidadesFinal: mapaDebilidades = new Map();
    let tipos = Object.keys(tipos_pokemon);

    //https://github.com/yashrajbharti/Pokemon-Type-Weakness-Calculator/blob/main/script.js
    if (debilidades.length == 2) {
        let deb1 = debilidades[0];
        let deb2 = debilidades[1];

        let mapDeb1: mapaDebilidades = new Map();
        let mapDeb2: mapaDebilidades = new Map();

        objectToMap(deb1, mapDeb1);
        objectToMap(deb2, mapDeb2);

        calcularFactor(mapDeb1, mapDeb2, debilidadesFinal);
        calcularFactor(mapDeb2, mapDeb1, debilidadesFinal);

    } else {
        let deb1 = debilidades[0];
        objectToMap(deb1, debilidadesFinal);
    }

    tipos.forEach((val) => {
        if (!debilidadesFinal.has(val)) {
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

function anyadirEstadistica(elementoContenedor: HTMLElement, estadistica: PokemonStat, tipo: string) {
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
    stPorcentaje.classList.add(estadistica.stat.name);

    let stSpan = document.createElement("span");
    stPorcentaje.appendChild(stSpan);

    let porcentajeAltura = (estadistica.base_stat * 100 / 255);
    stSpan.style.height = porcentajeAltura + "%";
    stSpan.style.top = (100 - porcentajeAltura) + "%";
    stSpan.classList.add(tipo);
    stValor.innerText = estadistica.base_stat.toString();
    stTitulo.innerText = abreviaturas_stats[estadistica.stat.name];
    stTitulo.title = traduccion_stats[estadistica.stat.name];

    let spanList: NodeListOf<HTMLSpanElement>;

    stPorcentaje.onmouseenter = () => {
        spanList = document.querySelectorAll<HTMLSpanElement>(`.barra_estadistica:not(.${estadistica.stat.name}) span`);
        spanList.forEach(element => {
            element.style.backgroundColor = "grey";
        });
    };

    stPorcentaje.onmouseleave = () => {
        spanList.forEach(element => {
            element.style.backgroundColor = "";
        });
    }
}

async function crearImagen(arrayImagen: number[], imagen: HTMLImageElement) {
    let datosImagen = Int8Array.from(await invoke("redimensionar_imagen", { imagen: arrayImagen, ancho: 200, alto: 200 }) as number[]);
    imagen.src = URL.createObjectURL(new Blob([datosImagen.buffer], { type: "image/png" }));
}

window.addEventListener("DOMContentLoaded", () => {
    document.querySelector("hola")
})