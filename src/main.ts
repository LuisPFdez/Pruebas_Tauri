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

function crearTarjetaPokemon (datosPokemon: Pokemon): HTMLElement {
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

  let nombre_reverso = document.createElement("h4");
  let p = document.createElement("p");
  reverso.appendChild(nombre_reverso);
  reverso.appendChild(p);
  
  nombre_reverso.innerHTML = datosPokemon.name;
  p.innerText = "Lorem" ;

  return area_tarjeta;

}

function fetchData<T>(url: URL | RequestInfo): Promise<T> {
  return fetch(url).then(data => data.json())
}

async function crearImagen(url: string, imagenHTML: HTMLImageElement) {
  //TODO Revisar console time, para ajustarlo al sistema de logs de tauri 
  console.time("imagen");
  let datos = Array.from(new Uint8Array(await (await fetch(url)).arrayBuffer()));
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

      document.querySelector("#imagenes")?.childNodes.forEach(cn => cn.remove());

      buscarPokemon(this.value);
    }
  });
});

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
    .then((datos) => {
      let pokemon = datos.varieties[0].pokemon;
      fetchData<typeof pokemon.type>(pokemon.url).then(datos => {
        let area_imagen = document.querySelector<HTMLDivElement>("#imagenes");
        // let area_pokemon = document.createElement("section");
        // area_pokemon.classList.add("area_pokemon");
        // let section_imagen_pokemon = document.createElement("section");
        // area_imagen?.appendChild(area_pokemon);

        // let imagen_pokemon = new Image();
        // imagen_pokemon.onclick = async () => {
        //   await invoke("abrir_nueva_ventana", {
        //     ruta: "sprites.html",
        //     titulo: `Sprites de ${capitalizarPrimeraLetra(datos.name)} Macho/Hembra`
        //   }).then(() => {
        //     invoke("pruebas");
        //   }
        //   );
        // };
        let cartaPokemon = crearTarjetaPokemon(datos);
        area_imagen?.appendChild(cartaPokemon);

        // let area_tipos = document.createElement("section");
        // section_imagen_pokemon.appendChild(imagen_pokemon);

        // section_imagen_pokemon.style.height = "300px";
        // section_imagen_pokemon.style.width = "300px";
        // crearImagen(datos.sprites.front_default, imagen_pokemon);

        // datos.types.forEach((tipo) => {
        //   const nombre_tipo = tipo.type.name;

        //   let div_tipo = document.createElement("div");
        //   let imagen_tipo = new Image(45, 45);
        //   let texto_tipo = document.createElement("span");

        //   area_tipos.appendChild(div_tipo).appendChild(imagen_tipo);
        //   area_tipos.classList.add("area_tipos");

        //   imagen_tipo.src = tipos_pokemon[nombre_tipo];
        //   imagen_tipo.alt = `Tipo ${traduccion_tipos[nombre_tipo]}`;

        //   div_tipo.classList.add(nombre_tipo, "tipos");
        //   texto_tipo.innerText = traduccion_tipos[nombre_tipo];

        //   div_tipo.appendChild(texto_tipo);
        // });

        // area_pokemon?.appendChild(section_imagen_pokemon);
        // area_pokemon?.appendChild(area_tipos);

      });
    })
    .catch(e => console.log("Error, ", e));
}

