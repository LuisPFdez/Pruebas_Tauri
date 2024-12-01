import { invoke } from "@tauri-apps/api/tauri";
import { listen, emit } from "@tauri-apps/api/event";
import { ConfirmDialogOptions, confirm, message, MessageDialogOptions } from "@tauri-apps/api/dialog";
import { trace, info, error, attachConsole } from "tauri-plugin-log-api";
import { tipos_pokemon } from "./assets/iconos";
import { capitalizarPrimeraLetra, eliminarContenido, enviarDatosVentana, fetchData } from "./utils";
import { paletaColoresType } from "./interfaces/tipos";
import { CuadroTipo } from "./components/cuadro-tipos";

const ancho_sprite = 300;
const alto_sprite = 300;

let esDesa: boolean = false;
let especiePokemon: PokemonSpecies;

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
  reverso.appendChild(crearSelectListForms(datosPokemon.forms, datosPokemon.id, nombre, imagen, seccion_tipos))
  reverso.appendChild(seccion_tipos);
  reverso.appendChild(crearBotonGrito(datosPokemon.cries));
  crearBotonPaleta(datosPokemon.sprites.front_default, datosPokemon.name).then((boton) => {
    reverso.appendChild(boton);
  }).catch((e) => {
    error(`Error al generar la paleta de colores ${e}`);
  })

  crearBotonComparador(datosPokemon).then((boton) => {
    reverso.appendChild(boton)
  }).catch((e) => {
    error(`Error al generar el comparador ${e}`);
  });

  nombre_reverso.innerText = datosPokemon.name;
  info_pokemon.innerText = descripcion.find(text => text.language.name == "es")?.flavor_text || "";
  seccion_tipos.classList.add("area_tipos");
  eliminarContenido(seccion_tipos);
  datosPokemon.types.forEach(tipo => {
    seccion_tipos.appendChild(new CuadroTipo(tipo.type.name));
  });

  return area_tarjeta;

}

function crearTipo(tipo: PokemonType, seccion_tipos: HTMLElement) {
  const nombre_tipo = tipo.type.name;

  let div_tipo = document.createElement("div");
  let imagen_tipo = new Image(30, 30);
  let texto_tipo = document.createElement("span");

  seccion_tipos.appendChild(div_tipo).appendChild(imagen_tipo);

  imagen_tipo.src = tipos_pokemon[nombre_tipo][0];
  imagen_tipo.alt = `Tipo ${tipos_pokemon[nombre_tipo][1]}`;

  div_tipo.classList.add(nombre_tipo, "tipo");
  texto_tipo.innerText = tipos_pokemon[nombre_tipo][1];

  div_tipo.appendChild(texto_tipo);
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
  let busqueda = document.querySelector<HeaderBusqueda>("#hBusqueda")!;

  busqueda.funcionBusqueda = (el) => {

    if (el.value.length == 0 || el.value.trim() == "") {
      mostrarInfo("Por favor introduce un pokemon o ID");
      return;
    }

    let imagenes = document.querySelector("#imagenes")
    if (imagenes) {
      eliminarContenido(imagenes);
    }

    buscarPokemon(el.value);
  }
});

function crearBotonGrito(gritosPokemon: PokemonCries): HTMLButtonElement {
  let botonReproducir = document.createElement("button");
  botonReproducir.innerHTML = "|>";

  botonReproducir.onclick = () => {
    enviarDatosVentana({ ventana: "reproductor", titulo: "Pruebas" }, { gritos: gritosPokemon });
  }

  return botonReproducir;
}

async function crearBotonPaleta(url: string, nombrePokemon: string): Promise<HTMLButtonElement> {
  let arrayImagen = await arrayFromURL(url);
  let paletaColores: paletaColoresType = await invoke("generar_paleta_imagen", { imagen: arrayImagen, tamanyo: 5 });
  localStorage.setItem("ArrayImagen", arrayImagen.toString());
  let botonPaleta = document.createElement("button");
  botonPaleta.innerHTML = "P";

  botonPaleta.onclick = () => {
    enviarDatosVentana({ ventana: "paleta", titulo: `Paleta colores ${capitalizarPrimeraLetra(nombrePokemon)}` }, { paletaColores: paletaColores });
  }

  return botonPaleta;
}

/** Crea un select list de las formas del pokemon */
function crearSelectListForms(forms: Array<NamedAPIResource<PokemonForm>>, id: number, h2: HTMLElement, imagen: HTMLImageElement, seccion_tipos: HTMLElement): HTMLElement {
  let sel = document.createElement("select");

  forms.forEach((val) => {
    let opt = document.createElement("option");
    sel.add(opt);

    opt.textContent = val.name;
    opt.value = val.url;


    if (val.url.split("/").includes(id.toString())) {
      info("Forma seleccionada: " + val.name + ", " + id);
      sel.value = val.url;
    }
  });

  sel.addEventListener("change", _ => {
    let opcion = sel.options[sel.selectedIndex].value;

    fetchData<PokemonForm>(opcion).then(datos => {
      crearImagen(datos.sprites.front_default, imagen);

      let h3: HTMLElement = h2.nextElementSibling as HTMLElement || document.createElement("h3");

      if (datos.id != id) {
        h3.classList.add("subnombre");
        h3.innerText = (datos.names.find(nombre => nombre.language.name == "es") || datos.names.find(nombre => nombre.language.name == "en")!).name;
        h2.after(h3);
      } else {
        h3.remove();
      }

      eliminarContenido(seccion_tipos);
      datos.types.forEach(tipo => {
        crearTipo(tipo, seccion_tipos);
      })
    });
  })

  return sel;
}

async function crearBotonComparador(datosPokemon: Pokemon): Promise<HTMLButtonElement> {
  let array = await arrayFromURL(datosPokemon.sprites.front_default)
  localStorage.setItem("ArrayImagen", array.toString());

  let botonComparador = document.createElement("button");

  botonComparador.innerText = "C";

  botonComparador.onclick = () => {
    enviarDatosVentana({ ventana: "comparador" }, { datosPokemon })
  }

  return botonComparador;
}

/**
 * Busca un pokemon en la api y recupera toda la informacion de este
 * @param pokemon
 */
function buscarPokemon(pokemon: string): void {
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
    .then((datosEspecies) => {
      especiePokemon = datosEspecies;
      //Busca el valor por defecto de una especie, aunque no deberia deberia de haber al menos 1 a true, en caso contrario, devuelve el primer valor
      let pokemon = (datosEspecies.varieties.find(val => val.is_default) || datosEspecies.varieties[0]).pokemon;
      fetchData<typeof pokemon.type>(pokemon.url).then(datos => {
        let area_imagen = document.querySelector<HTMLDivElement>("#imagenes");

        let cartaPokemon = crearTarjetaPokemon(datos, datosEspecies.flavor_text_entries);
        area_imagen?.appendChild(cartaPokemon);
      });
    })
    .catch((e: { mostrarRazon: boolean, razon: string }) => {
      let { mostrarRazon, razon } = e;
      error(`Error al buscar: ${razon}`);
      if (mostrarRazon) {
        mostrarInfo(razon);
      }
    });
}

