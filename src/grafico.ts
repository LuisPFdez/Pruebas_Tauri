import { abreviaturas_stats } from "./assets/iconos";

interface PuntoReferencia {
    x: number;
    y: number;
}

function dibujaFigura(dimension: number, numVertices: number, valorMaximo: number, etiquetas: Array<string>, totalFiguras: number = 10): HTMLCanvasElement {
    let canvas = document.createElement("canvas");
    canvas.height = dimension;
    canvas.width = dimension;
    let ctx = canvas.getContext("2d")!;

    let gradoRotacion = {
        3: -Math.PI / 2,
        5: -Math.PI / 2,
        6: Math.PI / 2
    }[numVertices] || 0;

    let angulo = 2 * Math.PI / numVertices;

    const margen = 40;
    const margenInterno = dimension / totalFiguras / 2;
    let radio = (dimension - margen * 2) / 2;
    let radioFiguraInterna = radio;
    let centro = dimension / 2;
    let referenciasVertices: Array<Array<PuntoReferencia>> = Array(totalFiguras);

    ctx.font = "20px Arial";
    ctx.fillStyle = "grey";
    ctx.lineWidth = 4;
    ctx.strokeStyle = "white"

    ctx.beginPath()
    for (let j = 0; j < totalFiguras; j++) {
        let vertices: Array<PuntoReferencia> = Array(numVertices);
        for (let i = 0; i < numVertices; i++) {

            let x = centro + radioFiguraInterna * Math.cos(i * angulo + gradoRotacion);
            let y = centro + radioFiguraInterna * Math.sin(i * angulo + gradoRotacion);

            if (i == 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y)
            }

            if (j == 0) {
                console.log("J: ", i * angulo + gradoRotacion, Math.cos(i * angulo + gradoRotacion),
                    Math.sin(i * angulo + gradoRotacion))
            }
            vertices[i] = { x, y };
        }
        referenciasVertices[j] = vertices;
        radioFiguraInterna -= margenInterno;
        ctx.closePath()
    }

    let desplazamiento = 20;
    referenciasVertices[0].forEach((vertice, index) => {
        let {width, actualBoundingBoxAscent} = ctx.measureText(etiquetas[index]);
        let angulo = Math.atan2(vertice.y - centro, vertice.x - centro);

        let x = vertice.x + desplazamiento * Math.cos(angulo);
        let y = vertice.y + desplazamiento * Math.sin(angulo);

        // let

        let dx =x- width / 2;
        let dy = y +actualBoundingBoxAscent / 2

        ctx.fillText(etiquetas[index],dx, dy);


        ctx.moveTo(vertice.x, vertice.y);
        ctx.lineTo(centro, centro);

        ctx.moveTo(vertice.x, vertice.y);
        ctx.lineTo(x, y);
    })

    ctx.stroke();
    return canvas;
}

//Datos de prueba
let fondo = dibujaFigura(800, 6, 255, ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio"]);
let canvas = document.getElementById("canvas") as HTMLCanvasElement;

let ctx = canvas.getContext("2d")!;
ctx.drawImage(fondo, 0, 0);