import { invoke } from "@tauri-apps/api/tauri";
import { listen, emit } from "@tauri-apps/api/event";
import { ConfirmDialogOptions, confirm, message, MessageDialogOptions } from "@tauri-apps/api/dialog";
import { trace, info, error, attachConsole } from "tauri-plugin-log-api";
import { tipos_pokemon, traduccion_tipos } from "./assets/iconos";
import { capitalizarPrimeraLetra } from "./utils";

const ancho_sprite = 300;
const alto_sprite = 300;

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

function crearTarjetaPokemon(datosPokemon: Pokemon, descripcion: Array<FlavorText>): HTMLElement {
  let area_tarjeta = document.createElement("section");
  let tarjeta = document.createElement("section");
  let frontal = document.createElement("section");
  let reverso = document.createElement("section");

  area_tarjeta.appendChild(tarjeta);
  tarjeta.appendChild(frontal);
  tarjeta.appendChild(reverso);

  area_tarjeta.classList.add("area_tarjeta");
  tarjeta.classList.add("tarjeta");
  frontal.classList.add("frontal");
  reverso.classList.add("reverso");

  let imagen = new Image();
  let nombre = document.createElement("h2");
  let area_imagen = document.createElement("section");
  frontal.appendChild(area_imagen);
  frontal.appendChild(nombre);
  area_imagen.appendChild(imagen);

  nombre.classList.add("nombre");
  nombre.textContent = datosPokemon.name;
  area_imagen.classList.add("imagen");
  area_imagen.style.width = "300px";
  area_imagen.style.height = "300px";
  crearImagen(datosPokemon.sprites.front_default, imagen);

  let nombre_reverso = document.createElement("h3");
  let info_pokemon = document.createElement("p");
  let seccion_tipos = document.createElement("section");
  reverso.appendChild(nombre_reverso);
  reverso.appendChild(info_pokemon);
  reverso.appendChild(seccion_tipos);
  reverso.appendChild(crearBotonGrito(datosPokemon.cries));
  crearBotonPaleta(datosPokemon.sprites.front_default, datosPokemon.name).then((boton) => {
    reverso.appendChild(boton);
  }).catch((e) => {
    error(`Error al generar la paleta de colores ${e}`);
  })

  nombre_reverso.innerText = datosPokemon.name;
  info_pokemon.innerText = descripcion.find((text) => text.language.name == "es")?.flavor_text || "";
  seccion_tipos.classList.add("area_tipos");
  datosPokemon.types.forEach(tipo => {
    const nombre_tipo = tipo.type.name;

    let div_tipo = document.createElement("div");
    let imagen_tipo = new Image(30, 30);
    let texto_tipo = document.createElement("span");

    seccion_tipos.appendChild(div_tipo).appendChild(imagen_tipo);

    imagen_tipo.src = tipos_pokemon[nombre_tipo];
    imagen_tipo.alt = `Tipo ${traduccion_tipos[nombre_tipo]}`;

    div_tipo.classList.add(nombre_tipo, "tipo");
    texto_tipo.innerText = traduccion_tipos[nombre_tipo];

    div_tipo.appendChild(texto_tipo);
  });


  return area_tarjeta;

}

function fetchData<T>(url: URL | RequestInfo): Promise<T> {
  return fetch(url).then(data => data.json())
}

async function arrayFromURL(url: URL | RequestInfo): Promise<Array<number>> {
  return Array.from(new Uint8Array(await ((await fetch(url)).arrayBuffer())));
}

async function crearImagen(url: string, imagenHTML: HTMLImageElement) {
  //TODO Revisar console time, para ajustarlo al sistema de logs de tauri 
  console.time("imagen");
  let datos = await arrayFromURL(url);
  let rgbImagen: number[] = await invoke("redimensionar_imagen", { imagen: datos, ancho: ancho_sprite, alto: alto_sprite });
  let datoss = Int8Array.from(rgbImagen);
  imagenHTML.src = URL.createObjectURL(new Blob([datoss.buffer], { type: 'image/png' }));
  console.timeEnd("imagen");
}

window.addEventListener("DOMContentLoaded", () => {
  let cuadro_busqueda = document.querySelector<HTMLInputElement>("#cuadro_busqueda");

  document.querySelector<HTMLButtonElement>("#boton_busqueda")?.addEventListener("click", () => {
    cuadro_busqueda?.dispatchEvent(new KeyboardEvent("keypress", { key: "Enter" }));
  })

  cuadro_busqueda?.addEventListener("keyup", function () {
    this.value = this.value.toLowerCase();
  });

  cuadro_busqueda?.addEventListener("keypress", function (evento) {
    if (evento.key == "Enter") {
      if (this.value.length == 0 || this.value.trim() == "") {
        mostrarInfo("Por favor introduce un pokemon o ID");
        return;
      }

      let imagenes = document.querySelector("#imagenes")
      if (imagenes) {
        eliminarContenido(imagenes);
      }

      buscarPokemon(this.value);
    }
  });
});

function crearBotonGrito(gritosPokemon: PokemonCries): HTMLButtonElement {
  let botonReproducir = document.createElement("button");
  botonReproducir.innerHTML = "|>";
  let audio = new Audio(gritosPokemon.latest);

  botonReproducir.onclick = () => {
    audio.play();
  }

  return botonReproducir;
}

async function crearBotonPaleta(url: string, nombrePokemon: string): Promise<HTMLButtonElement> {
  let arrayImagen = await arrayFromURL(url);
  let paletaColores: paletaColoresType = await invoke("generar_paleta_imagen", { imagen: arrayImagen, tamanyo: 5 });
  let botonPaleta = document.createElement("button");
  botonPaleta.innerHTML = "P";

  botonPaleta.onclick = () => {
    enviarDatosVentana({ ventana: "paleta", titulo: `Paleta colores ${nombrePokemon}` }, { paletaColores: paletaColores });
  }

  return botonPaleta;
}

/**
 * Busca un pokemon en la api y recupera toda la informacion de este
 * @param pokemon
 */
function buscarPokemon(pokemon: string) {
  fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemon}`)
    .then(data => {
      if (data.status != 200) {
        let razon;
        switch (data.status) {
          case 404:
            razon = "Nombre de pokemon o ID incorrecto";
            break;
          default:
            razon = `Error ${data.status}. ${data.statusText}`;
            break;
        }
        return Promise.reject(razon);
      }
      return data.json() as Promise<PokemonSpecies>;
    })
    .then((datosEspecies) => {
      let pokemon = datosEspecies.varieties[0].pokemon;
      fetchData<typeof pokemon.type>(pokemon.url).then(datos => {
        let area_imagen = document.querySelector<HTMLDivElement>("#imagenes");
       
        let cartaPokemon = crearTarjetaPokemon(datos, datosEspecies.flavor_text_entries);
        area_imagen?.appendChild(cartaPokemon);
      });
    })
    .catch(e => console.log("Error, ", e));
}

