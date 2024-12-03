import { invoke } from "@tauri-apps/api";
import { emit, listen, Event, UnlistenFn } from "@tauri-apps/api/event";
import { WebviewWindow } from "@tauri-apps/api/window";
import { estadoVentana, rgbArray } from "./interfaces/tipos";
import { ErrorVentana } from "./errors/ErrorVentana";
import { error } from "tauri-plugin-log-api";
import { message, MessageDialogOptions } from "@tauri-apps/api/dialog";

let emisor: UnlistenFn = () => { };

function capitalizarPrimeraLetra(texto: string): string {
    return `${texto.charAt(0).toLocaleUpperCase()}${texto.slice(1)}`
}

function ejecutarFuncionAlCargarDoc(doc: Document, funcion: Function): void {
    if (doc.readyState == "complete") {
        funcion()
    } else {
        doc.addEventListener("DOMContentLoaded", () => {
            funcion();
        })
    }
}

async function obtenerLabelVentana(nombre: string): Promise<string> {
    let prefijo_ventana = await invoke("prefijo_ventana");
    return `${prefijo_ventana}${nombre}`;
}

function enviarDatosVentana(propiedades: { ventana: string, titulo?: string }, datos: Record<string, unknown>) {
    invoke("abrir_nueva_ventana", propiedades).then(async (estado) => {
        let [_, ventanaCreada] = estado as estadoVentana;
        const window = WebviewWindow.getByLabel(await obtenerLabelVentana(propiedades.ventana));
        if (ventanaCreada) {
            emisor();
            window?.listen("ventana_cargada", _ => {
                window.emit("datos_ventana", datos);
            }).then(em => emisor = em);
        } else {
            window?.emit("datos_ventana", datos);
        }
    }).catch((estado) => {
        let mensaje = estado as string;
        throw new ErrorVentana(mensaje);
    });

}

function eventoVentanaCargada<T>(callback: (evento: Event<T>) => void) {
    listen("datos_ventana", (e: Event<T>) => {
        callback(e)
    });

    emit("ventana_cargada");
}

function rgbAHexadecimal(rgb: rgbArray): string {
    return "#".concat(rgb[0].toString(16).padStart(2, "0"), rgb[1].toString(16).padStart(2, "0"), rgb[2].toString(16).padStart(2, "0"));
}

function colorComplementario(rgb: rgbArray): rgbArray {
    return [
        255 - rgb[0], 255 - rgb[1], 255 - rgb[2]
    ]
}

function eliminarContenido(nodos: Node) {
    while (nodos.firstChild) {
        nodos.firstChild.remove();
    }
}

function fetchData<T>(url: URL | RequestInfo): Promise<T> {
    return fetch(url).then(data => data.json())
}

function mostrarInfo(mensaje: string, titulo?: string) {
    let opcionesDialogo: MessageDialogOptions = {
        okLabel: "Cerrar",
        title: titulo,
        type: "info"
    }

    message(mensaje, opcionesDialogo);
}

/**
* Busca un pokemon en la api y recupera toda la informacion de este
* @param pokemon
*/
function buscarPokemon(pokemon: string, callback: (val: PokemonSpecies) => void): void {
    fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemon}`)
        .then(data => {
            if (data.status != 200) {
                let razon: string;
                let mostrarRazon: boolean = false;

                switch (data.status) {
                    case 404:
                        razon = "Nombre de pokemon o ID incorrecto";
                        mostrarRazon = true;
                        break;
                    default:
                        razon = `Error ${data.status}. ${data.statusText}`;
                        break;
                }

                return Promise.reject({ mostrarRazon, razon });
            }

            return data.json() as Promise<PokemonSpecies>;
        })
        .then(callback)
        .catch((e: { mostrarRazon: boolean, razon: string }) => {
            let { mostrarRazon, razon } = e;
            error(`Error al buscar: ${razon}`);

            if (mostrarRazon) {
                mostrarInfo(razon);
            }
        });
}

async function arrayFromURL(url: URL | RequestInfo): Promise<Array<number>> {
    return Array.from(new Uint8Array(await ((await fetch(url)).arrayBuffer())));
}

export {
    capitalizarPrimeraLetra,
    ejecutarFuncionAlCargarDoc,
    obtenerLabelVentana,
    enviarDatosVentana,
    eventoVentanaCargada,
    rgbAHexadecimal,
    colorComplementario,
    eliminarContenido,
    fetchData,
    mostrarInfo,
    buscarPokemon,
    arrayFromURL
};