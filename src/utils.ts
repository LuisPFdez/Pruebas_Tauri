import { invoke } from "@tauri-apps/api";
import { emit, listen, Event, UnlistenFn } from "@tauri-apps/api/event";
import { WebviewWindow } from "@tauri-apps/api/window";
import { estadoVentana, rgbArray } from "./interfaces/tipos";
import { ErrorVentana } from "./errors/ErrorVentana";

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

export { capitalizarPrimeraLetra, ejecutarFuncionAlCargarDoc, obtenerLabelVentana, enviarDatosVentana, eventoVentanaCargada, rgbAHexadecimal, colorComplementario, eliminarContenido, fetchData };