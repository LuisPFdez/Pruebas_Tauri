import { invoke } from "@tauri-apps/api";
import { emit, listen, Event } from "@tauri-apps/api/event";
import { WebviewWindow } from "@tauri-apps/api/window";
import { estadoVentana } from "./interfaces/tipos";
import { ErrorVentana } from "./errors/ErrorVentana";

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
        console.log("Enviar Datos, antes de evento", window, ventanaCreada)
        if (ventanaCreada) {


            window?.listen("ventana_cargada", _ => {
                console.log("Enviar datos, escuchando evento", window)
                window.emit("datos_ventana", datos);
            });
        } else {
            window?.emit("datos_ventana", datos);
        }
    }).catch((estado) => {
        let [mensaje, _] = estado as estadoVentana;
        throw new ErrorVentana(mensaje);
    });

}

function eventoVentanaCargada<T>(callback: (evento: Event<T>) => void) {
    console.log("Entra en la funcion de evento")

    listen("datos_ventana", (e: Event<T>) => {
        console.log("Recibir datos, escuchando evento")
        callback(e)
    });

    emit("ventana_cargada").then(() => {
        console.log("Recibir datos, emitir evento");
    });
}

export { capitalizarPrimeraLetra, ejecutarFuncionAlCargarDoc, obtenerLabelVentana, enviarDatosVentana, eventoVentanaCargada };