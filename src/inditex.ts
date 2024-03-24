import { listen } from "@tauri-apps/api/event";

await listen("cierrate", (evento) => {
    console.log("Evento recibido", evento);
});