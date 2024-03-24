import { invoke } from "@tauri-apps/api/tauri";
import { listen, emit } from "@tauri-apps/api/event";
import { ConfirmDialogOptions, confirm } from "@tauri-apps/api/dialog";

import { trace, info, error, attachConsole } from "tauri-plugin-log-api";

async function log() {

  interface evento {
    level: number,
    message: string
  }

  //La funcion attachConsole, es en en general un simple escucha de eventos que luego decora
  //haciendo diferentes parseos del payload y usando distitos logs en funcion del nivel
  let evento = await listen("log://log", ({payload}) => {
      let {level, message} = payload as evento;
      console.log("Nivel: ", level, ", Mensaje: ", message);
  });

  trace("Trace");
  info("Info");
  error("Error");
  
  evento();
}

let greetInputEl: HTMLInputElement | null;
let greetMsgEl: HTMLElement | null;

listen("cerrar_ventanas", async (evento) => {
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

window.addEventListener("DOMContentLoaded", () => {
  greetInputEl = document.querySelector("#greet-input");
  greetMsgEl = document.querySelector("#greet-msg");
  document.querySelector("#greet-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    greet();
  });

  document.querySelector("#pruebas")?.addEventListener("click", () => {
    log();
  })
});
