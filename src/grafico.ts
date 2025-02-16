// import { abreviaturas_stats } from "./assets/iconos";

interface PuntoReferencia {
    x: number;
    y: number;
}

/**
 * Metodo que 
 * @param dimension 
 * @param numVertices 
 * @param valorMaximo 
 * @param etiquetas 
 * @param totalFiguras 
 * @returns 
 */
function dibujaFigura(dimension: number, numVertices: number, valorMaximo: number, etiquetas: Array<string>, totalFiguras: number = 5): { canvas: HTMLCanvasElement, vertices: Array<PuntoReferencia> } {
    let canvas = document.createElement("canvas");
    canvas.height = dimension;
    canvas.width = dimension;
    let ctx = canvas.getContext("2d")!;

    //Indica un grado de rotacion para algunas figuras en funcion de se numero de vertices
    let gradoRotacion = {
        3: -Math.PI / 2,
        5: -Math.PI / 2,
        6: Math.PI / 2,
        7: -Math.PI / 2
    }[numVertices] || 0;

    let angulo = 2 * Math.PI / numVertices;

    //Magen externo, de la figura exterior respecto a los bordes del canvas
    const margen = 40;
    //Margen entre las figuras
    const margenInterno = dimension / totalFiguras / 2;
    let radio = (dimension - margen * 2) / 2;
    //El radio de la figura interna sera el se utilize para dibujar todas las figuras, al principio será el radio de la figura externa 
    //y a medida que se itere a traves de las figuras se le restara el margen interno
    let radioFiguraInterna = radio;
    //La figura es cuadra por lo que el centro es igual tanto para x como para y
    let centro = dimension / 2;
    //Array que guarda todos los vertices de cada figura, el primer array representa cada figura, mientras que el segundo, 
    //representa los puntos de esta
    let referenciasVertices: Array<Array<PuntoReferencia>> = Array(totalFiguras);

    //Estilo de las figuras
    ctx.font = "20px Arial";
    ctx.fillStyle = "grey";
    ctx.lineWidth = 4;
    ctx.strokeStyle = "white"

    ctx.beginPath()

    for (let j = 0; j < totalFiguras; j++) {
        let vertices: Array<PuntoReferencia> = Array(numVertices);
        for (let i = 0; i < numVertices; i++) {

            //Calcula los vertices de cada figura
            let x = centro + radioFiguraInterna * Math.cos(i * angulo + gradoRotacion);
            let y = centro + radioFiguraInterna * Math.sin(i * angulo + gradoRotacion);

            //Si es el primer vertice se mueve a este, sino dibuja una linea desde el anterior
            if (i == 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y)
            }

            vertices[i] = { x, y };
        }

        referenciasVertices[j] = vertices;
        radioFiguraInterna -= margenInterno;
        ctx.closePath()
    }

    //El desplazamiento indica la distancia entre el texto y el los vertices de la figura externa
    let desplazamiento = 15;
    referenciasVertices[0].forEach((vertice, index) => {
        //Obtiene el ancho y el alto del texto
        let { width, actualBoundingBoxAscent } = ctx.measureText(etiquetas[index]);
        //Calcula el angulo a partir de los vertices
        let angulo = Math.atan2(vertice.y - centro, vertice.x - centro);

        //Calcula la posicion del texto
        let x = vertice.x + desplazamiento * Math.cos(angulo);
        let y = vertice.y + desplazamiento * Math.sin(angulo);

        //Ajusta la posicion x segun el ancho y su posicion respecto al centro, si el vertice esta en el centro, calcula la mitad
        //Si el vertice es mayor al centro no hace nada con el ancho y si es menor, resta el ancho entero, los vertices en el centro 
        //puenden no ser exactamente el valor al centro y variar por unas millonesimas, por lo que rendondea
        let px = x - (width * (Math.round(vertice.x) >= centro ? Math.round(vertice.x) > centro ? 0 : 0.5 : 1));
        let py = y + actualBoundingBoxAscent / 2;

        ctx.fillText(etiquetas[index], px, py);

        //Dibuja unas lineas rectas desde el vertice hasta el centro
        ctx.moveTo(vertice.x, vertice.y);
        ctx.lineTo(centro, centro);
    })

    ctx.stroke();
    return { canvas, vertices: referenciasVertices[0] };
}

function dibujarValores(arrayValores: Array<Array<number>>, maximo: number, vertices: Array<PuntoReferencia>, ctx: CanvasRenderingContext2D) {
    let centro = 400;
    arrayValores.forEach(valores => {
        valores.forEach((valor, index) => {
            let porcentaje = valor / maximo;
            let { x, y } = vertices[index];

            console.log("Console log 1", x, y, porcentaje, x == 400);
            x = (x - centro) * porcentaje + centro
            y = (y - centro) * porcentaje + centro
            console.log("Console log 2", x, y);

            if (index == 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }

        });
    })
    ctx.fillStyle = "rgba( 46, 64, 83, 0.5 )"
    ctx.fill();
}

//Datos de prueba
let { canvas: fondo, vertices } = dibujaFigura(800, 8, 255, ["Enero1231", "Febrero1321312", "Marzo1313121", "Abril131313", "Mayo12313312", "Junio1231312"]);
let canvas = document.getElementById("canvas") as HTMLCanvasElement;

let ctx = canvas.getContext("2d")!;
ctx.drawImage(fondo, 0, 0);

dibujarValores([[30, 100, 100, 250, 130, 120]], 255, vertices, ctx);

