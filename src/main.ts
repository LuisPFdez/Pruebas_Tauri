import { invoke } from "@tauri-apps/api/tauri";
import { listen, emit } from "@tauri-apps/api/event";
import { ConfirmDialogOptions, confirm } from "@tauri-apps/api/dialog";

import { trace, info, error, attachConsole } from "tauri-plugin-log-api";

//Funcion que de muestra para capturar los logs atraves de los eventos
async function log() {

  interface evento {
    level: number,
    message: string
  }

  //La funcion attachConsole, es en en general un simple escucha de eventos que luego decora
  //haciendo diferentes parseos del payload y usando distitos logs en funcion del nivel
  let evento = await listen("log://log", ({ payload }) => {
    let { level, message } = payload as evento;
    console.log("Nuevo eventfo log nivel: ", level, ", Mensaje: ", message);
  });

  trace("Trace");
  info("Info");
  error("Error");

  //Para dejar de escuchar los eventos bastara con ejecutar la funcion que retorna listen()
  evento();
}

let greetInputEl: HTMLInputElement | null;
let greetMsgEl: HTMLElement | null;

listen("cerrar_ventanas", async (_) => {
  let opcionesDialogo: ConfirmDialogOptions = {
    title: "Salir de la aplicacion",
    okLabel: "Aceptar",
    cancelLabel: "Cancelar"
  }

  if (await confirm("Esto cerrara todas las ventanas. ¿Cerrar?", opcionesDialogo)) {
    emit("event-name", "");
  }
});

async function greet() {
  if (greetMsgEl && greetInputEl) {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    greetMsgEl.textContent = await invoke("greet", {
      name: greetInputEl.value,
    });
  }
}

async function pruebas() {
  await invoke("abrir_nueva_ventana", {
    ruta: "inditex.html"
  }).then((e) => {
    console.log("Correcto : ", e);
  }).catch((er) => {
    console.error("Error hola: ", er);
  });

}

window.onload = async function () {
  //Llama a la funcion log
  await log();

  //Usa el sistema de escucha de logs de tauri
  attachConsole();
}

window.addEventListener("DOMContentLoaded", () => {
  greetInputEl = document.querySelector("#greet-input");
  greetMsgEl = document.querySelector("#greet-msg");
  document.querySelector("#greet-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    greet();
  });

  document.querySelector("#pruebas")?.addEventListener("click", () => {
    pruebas();
  })
});
