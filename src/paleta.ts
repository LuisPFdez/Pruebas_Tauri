import { info } from "tauri-plugin-log-api";
import { paletaColoresType } from "./interfaces/tipos";
import { colorComplementario, ejecutarFuncionAlCargarDoc, eliminarContenido, eventoVentanaCargada, rgbAHexadecimal } from "./utils";
import { invoke } from "@tauri-apps/api";

let botonCargados = false;

interface datosEvento {
    paletaColores: paletaColoresType
}

eventoVentanaCargada((evento) => {
    let paletaColores = (evento.payload as datosEvento).paletaColores;
    ejecutarFuncionAlCargarDoc(document, () => domCargado(paletaColores));
})

function crearNuevoNodo(main: HTMLElement) {
    let nodoColores = document.createElement("section");
    nodoColores.classList.add("nodoColores");
    main.appendChild(nodoColores);
    return nodoColores;
}

function domCargado(paleta: paletaColoresType) {
    let main = document.querySelector("main")!;
    generarPaleta(paleta, main);
    if(!botonCargados) {
        botonCargados = true;
        let elementoContenedor = document.createElement("section");
        elementoContenedor.classList.add("botonesCont");
        main.appendChild(elementoContenedor);
        main.parentElement?.appendChild(elementoContenedor);
        
        let btnRegenPaleta = document.createElement("button");
        let inptRegenPaleta = document.createElement("input");
        inptRegenPaleta.min = "0";
        inptRegenPaleta.max = "100"
        inptRegenPaleta.type = "number";
        btnRegenPaleta.innerText = "Regenerar paleta";
        btnRegenPaleta.addEventListener("click", () => {
            if(Number.isNaN(inptRegenPaleta.value)) {
                throw new Error("Error, el valor no es un numero");
            }

            let valorInput = Number(inptRegenPaleta.value);
            if (valorInput > 20) {
                alert("Los valores mayores a 20 pueden causar problemas");
            }

            let arrayImagenString = localStorage.getItem("ArrayImagen");

            if(arrayImagenString != null) {
                let arrayImagen =  arrayImagenString.split(",").map((val) => {
                    return Number(val);
                });

                invoke("generar_paleta_imagen", { imagen: arrayImagen, tamanyo: valorInput }).then((datos: paletaColoresType) => {
                    generarPaleta(datos, main);
                }) .catch (e => {throw e});

            } else {
                throw new Error("Error al recuperar esto");
            }
        })
        
        elementoContenedor.appendChild(inptRegenPaleta);
        elementoContenedor.appendChild(btnRegenPaleta);
    }
}

async function generarPaleta(paleta: paletaColoresType, elementoPadre: HTMLElement) {
    eliminarContenido(elementoPadre);

    let nodoColores = crearNuevoNodo(elementoPadre )  

    paleta.forEach((color) => {
        let hexadecimal = rgbAHexadecimal(color);
        info(`Color R: ${color[0]}, G: ${color[1]}, B:${color[2]}. HEX ${hexadecimal}`);
        let recuadroColor = document.createElement("section");
        if (nodoColores.childElementCount >= 3) {
            nodoColores = crearNuevoNodo(elementoPadre);
            nodoColores.appendChild(recuadroColor);
        } else {
            nodoColores.appendChild(recuadroColor);
        }
        
        recuadroColor.classList.add("color");
        recuadroColor.title = `Copiar color ${hexadecimal}`;
        recuadroColor.style.backgroundColor = hexadecimal;
        recuadroColor.onclick = () => {
            let nodoInfo = document.createElement("section");
            nodoInfo.innerText = `Color copiado`;
            nodoInfo.style.backgroundColor = rgbAHexadecimal(colorComplementario(color));
            nodoInfo.style.color = hexadecimal;
            nodoInfo.classList.add("nodoInfo");
            
            setTimeout(() => {
                nodoInfo.remove();
            }, 1000);

            recuadroColor.appendChild(nodoInfo);
            navigator.clipboard.writeText(hexadecimal);
        }
    })
}
