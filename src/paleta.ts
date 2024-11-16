import { info } from "tauri-plugin-log-api";
import { paletaColoresType } from "./interfaces/tipos";
import { colorComplementario, ejecutarFuncionAlCargarDoc, eliminarContenido, eventoVentanaCargada, rgbAHexadecimal } from "./utils";

interface datosEvento {
    paletaColores: paletaColoresType
}

eventoVentanaCargada((evento) => {
    let paletaColores = (evento.payload as datosEvento).paletaColores;
    ejecutarFuncionAlCargarDoc(document, () => generarPaleta(paletaColores));
})

function crearNuevoNodo(main: HTMLElement) {
    let nodoColores = document.createElement("section");
    nodoColores.classList.add("nodoColores");
    main.appendChild(nodoColores);
    return nodoColores;
}


async function generarPaleta(paleta: paletaColoresType) {
    let main = document.querySelector("main")!;
    eliminarContenido(main);

    let nodoColores = crearNuevoNodo(main )  

    paleta.forEach((color) => {
        let hexadecimal = rgbAHexadecimal(color);
        info(`Color R: ${color[0]}, G: ${color[1]}, B:${color[2]}. HEX ${hexadecimal}`);
        let recuadroColor = document.createElement("section");
        if (nodoColores.childElementCount >= 3) {
            nodoColores = crearNuevoNodo(main);
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
