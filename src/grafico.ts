import { abreviaturas_stats } from "./assets/iconos";

interface PuntoReferencia {
    x: number;
    y: number;
}

function dibujaFondo(dimension: number): HTMLCanvasElement {
    const puntosReferencias = new Map<string, PuntoReferencia>();
    const canvas = document.createElement("canvas");
    canvas.height = dimension;
    canvas.width = dimension;

    const alt = canvas.height;
    const anc = canvas.width;
    const ctx = canvas.getContext("2d")!;


    const margen = 35;
    let margenInterno = margen;
    const numFormas = 5;
    //Calcula la distribucion que tiene que haber entre las formas. 
    //Por el modo en que se dibuja la forma se calcula apartir de la mitad.
    const espacioEntreFormas = (alt / numFormas) / 2;

    ctx.font = "20px Arial";
    ctx.fillStyle = "grey";
    ctx.lineWidth = 4;
    ctx.strokeStyle = "white"

    let { centro, bordeSuperiorY, bordeIzquierdoX, puntoSuperiorY, puntoInferiorY, bordeInferiorY, bordeDerechoX } = calcularMedidas(margen);
    [
        {
            x1: centro, y1: bordeSuperiorY, x2: centro, y2: bordeInferiorY
        },
        {
            x1: bordeIzquierdoX, y1: puntoSuperiorY, x2: bordeDerechoX, y2: puntoInferiorY
        },
        {
            x1: bordeIzquierdoX, y1: puntoInferiorY, x2: bordeDerechoX, y2: puntoSuperiorY
        }
    ].forEach(({ x1, x2, y1, y2 }) => {
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    });


    // ctx.moveTo(bordeDerechoX, puntoInferiorY);
    // ctx.lineTo(bordeDerechoX + 20, puntoInferiorY + 10);
    // ctx.stroke()

    // ["hp", "attack", "D", "AE", "DE", "V"].forEach(("v"));

    puntosReferencias.set("hp", { x: centro, y: bordeSuperiorY });
    puntosReferencias.set("attack", { x: bordeDerechoX, y: puntoSuperiorY });
    puntosReferencias.set("defense", { x: bordeDerechoX, y: puntoInferiorY });
    puntosReferencias.set("special-attack", { x: centro, y: bordeInferiorY });
    puntosReferencias.set("speed", { x: bordeIzquierdoX, y: puntoInferiorY });
    puntosReferencias.set("special-defense", { x: bordeIzquierdoX, y: puntoSuperiorY });

    let correccionesPosicion = [[1, -2], [-1, -0.25], [-1, 2], [1, 4], [3, 2], [2, -2]];
    let index = 0;
    ctx.lineWidth = 1;
    puntosReferencias.forEach((val, key) => {
        let abre = abreviaturas_stats[key];

        let { width, actualBoundingBoxAscent } = ctx.measureText(abre);
        let [x, y] = correccionesPosicion[index];
        ctx.fillText(abre, (val.x - (width / 2) * x), (val.y + actualBoundingBoxAscent / 2 * y))
        index++;
    })

    ctx.lineWidth = 4;

    for (let index = 1; index <= numFormas; index++) {
        let { centro, bordeSuperiorY, bordeIzquierdoX, puntoSuperiorY, puntoInferiorY, bordeInferiorY, bordeDerechoX } = calcularMedidas(margenInterno);
        ctx.beginPath();
        ctx.moveTo(centro, bordeSuperiorY);

        //Lado izquierdo
        ctx.lineTo(bordeIzquierdoX, puntoSuperiorY);
        ctx.lineTo(bordeIzquierdoX, puntoInferiorY);
        ctx.lineTo(centro, bordeInferiorY);

        //Lado derecho
        ctx.lineTo(bordeDerechoX, puntoInferiorY);
        ctx.lineTo(bordeDerechoX, puntoSuperiorY);
        ctx.lineTo(centro, bordeSuperiorY);

        ctx.closePath()
        ctx.stroke();

        let texto = `${255 / numFormas * index}`;
        let { width, } = ctx.measureText(texto);
        ctx.fillText(texto, centro + 10, centro - (espacioEntreFormas * index) + (margen));
        
        margenInterno += espacioEntreFormas;
    }



    //Calcula los datos
    function calcularMedidas(margen: number) {
        const bordeIzquierdoX = margen;
        //El canva es cuadrado por lo que no importa de donde se calcule el centro
        const centro = anc / 2;
        const bordeDerechoX = anc - margen;
        const bordeInferiorY = alt - margen;
        const bordeSuperiorY = margen;
        const distanciaEntrePuntos = bordeInferiorY - bordeSuperiorY;
        const puntoSuperiorY = bordeSuperiorY + distanciaEntrePuntos / 4;
        const puntoInferiorY = bordeInferiorY - (distanciaEntrePuntos / 4);
        return { centro, bordeSuperiorY, bordeIzquierdoX, puntoSuperiorY, puntoInferiorY, bordeInferiorY, bordeDerechoX };
    }

    return canvas;
}

let fondo = dibujaFondo(800);
let canvas = document.getElementById("canvas") as HTMLCanvasElement;

let ctx = canvas.getContext("2d")!;
ctx.drawImage(fondo, 0, 0);

// ctx.rect(390, 590, 20, 20);
// ctx.fill();
