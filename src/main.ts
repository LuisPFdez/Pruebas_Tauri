import { invoke } from "@tauri-apps/api/tauri";
import { listen, emit } from "@tauri-apps/api/event";
import { ConfirmDialogOptions, confirm, message, MessageDialogOptions } from "@tauri-apps/api/dialog";
import { trace, info, error, attachConsole } from "tauri-plugin-log-api";
import { tipos_pokemon, traduccion_tipos } from "./assets/iconos";

let esDesa: boolean = false;

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

function mostrarInfo(mensaje: string, titulo?: string) {
  let opcionesDialogo: MessageDialogOptions = {
    okLabel: "Cerrar",
    title: titulo,
    type: "info"
  }

  message(mensaje, opcionesDialogo);
}

listen("cerrar_ventanas", async (_) => {
  let opcionesDialogo: ConfirmDialogOptions = {
    title: "Salir de la aplicacion",
    okLabel: "Aceptar",
    cancelLabel: "Cancelar"
  }

  if (await confirm("Esto cerrara todas las ventanas. ¿Cerrar?", opcionesDialogo)) {
    await emit("cerrar_ventana");
    console.log("Ventanas cerradas");
  }
});


window.onload = async function () {
  //Comprueba si esta en modo debug para mostrar los logs de ejemplo
  esDesa = await invoke("es_desa");

  if (esDesa) {
    //Llama a la funcion log
    await log();

    //Usa el sistema de escucha de logs de tauri
    attachConsole();
  }
}

function fetchData<T>(url: URL | RequestInfo): Promise<T> {
  return fetch(url).then(data => data.json() as Promise<T>)
}

window.addEventListener("DOMContentLoaded", () => {
  let cuadro_busqueda = document.querySelector<HTMLInputElement>("#cuadro_busqueda");

  cuadro_busqueda?.addEventListener("keyup", function () {
    this.value = this.value.toLowerCase();
  });

  cuadro_busqueda?.addEventListener("keypress", function (evento) {
    if (evento.key == "Enter") {
      if (this.value.length == 0 || this.value.trim() == "") {
        mostrarInfo("Por favor introduce un pokemon o ID");
        return;
      }

      fetch(`https://pokeapi.co/api/v2/pokemon-species/${this.value}`)
        .then(data => {
          if (data.status != 200) {
            let razon;
            switch (data.status) {
              case 404:
                razon = "Nombre de pokemon o ID incorrecto";
                break;
              default:
                razon = `Error ${data.status}. ${data.statusText}`
                break;
            }
            return Promise.reject(razon);
          }
          return data.json() as Promise<PokemonSpecies>
        })
        .then((datos) => {
          let pokemon = datos.varieties[0].pokemon;
          fetchData<typeof pokemon.type>(pokemon.url).then(datos => {
            let area_imagen = document.querySelector<HTMLDivElement>("#imagenes");
            let area_pokemon = document.createElement("section");
            area_imagen?.appendChild(area_pokemon);

            let imagen_pokemon = new Image(150, 150);
            let area_tipos = document.createElement("section");

            imagen_pokemon.src = datos.sprites.front_default;

            datos.types.forEach((tipo) => {
              const nombre_tipo = tipo.type.name;

              let div_tipo = document.createElement("div");
              let imagen_tipo = new Image(45, 45);
              let texto_tipo = document.createElement("span");

              area_tipos.appendChild(div_tipo).appendChild(imagen_tipo);
              area_tipos.classList.add("area_tipos")

              imagen_tipo.src = tipos_pokemon[nombre_tipo];
              imagen_tipo.alt = `Tipo ${traduccion_tipos[nombre_tipo]}`

              div_tipo.classList.add(nombre_tipo, "tipos")
              texto_tipo.innerText = traduccion_tipos[nombre_tipo];

              div_tipo.appendChild(texto_tipo);
            });

            area_pokemon?.appendChild(imagen_pokemon);
            area_pokemon?.appendChild(area_tipos);

          });
        })
        .catch(e => console.log("Error, ", e));
    }
  });
});
