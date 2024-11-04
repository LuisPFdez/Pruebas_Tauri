import { info } from "tauri-plugin-log-api";
import { paletaColoresType } from "./interfaces/tipos";
import { ejecutarFuncionAlCargarDoc, eliminarContenido, eventoVentanaCargada, rgbAHexadecimal } from "./utils";

let datos = false;

interface datosEvento {
    paletaColores: paletaColoresType
}

eventoVentanaCargada((evento) => {
    let paletaColores = (evento.payload as datosEvento).paletaColores;
    ejecutarFuncionAlCargarDoc(document, () => generarPaleta(paletaColores));
})

function generarPaleta(paleta: paletaColoresType) {
    
    if(true) {
        console.log(window.opener);
    }

    
    let main = document.querySelector("main")!;
    eliminarContenido(main);

    paleta.forEach((color) => {
        let hexadecimal = rgbAHexadecimal(color);
        info(`Color R: ${color[0]}, G: ${color[1]}, B:${color[2]}. HEX ${hexadecimal}`);

        let recuadroColor = document.createElement("section");
        main.appendChild(recuadroColor);

        recuadroColor.classList.add("color");
        recuadroColor.style.backgroundColor = hexadecimal;
        recuadroColor.onclick = () => {
            navigator.clipboard.writeText(hexadecimal);
        }
    })
}
