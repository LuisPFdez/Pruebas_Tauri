import { invoke } from "@tauri-apps/api";
import { emit, listen, Event } from "@tauri-apps/api/event";
import { WebviewWindow } from "@tauri-apps/api/window";
import { estadoVentana, rgbArray } from "./interfaces/tipos";
import { ErrorVentana } from "./errors/ErrorVentana";
import { info } from "tauri-plugin-log-api";

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
            window?.listen("ventana_cargada", _ => {
                window.emit("datos_ventana", datos);
            });
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
    return "#".concat(rgb[0].toString(16), rgb[1].toString(16), rgb[2].toString(16));
}

function eliminarContenido(nodos: Node) {
   while(nodos.firstChild){
        nodos.firstChild.remove();
   }
}

export { capitalizarPrimeraLetra, ejecutarFuncionAlCargarDoc, obtenerLabelVentana, enviarDatosVentana, eventoVentanaCargada, rgbAHexadecimal, eliminarContenido };