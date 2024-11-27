// import style from "./header-busqueda.css";
let template = document.createElement("template");

template.innerHTML = `
<header id="busqueda">
    <link rel="stylesheet" href="/src/components/header-busqueda.css" />
    <input type="text" id="cuadro_busqueda">
    <button id="boton_busqueda"></button>
</header>
`

class HeaderBusqueda extends HTMLElement {
    _funcionBusqueda: (event: HTMLInputElement) => void;
    _contenidoBoton: string | null;

    public get placeholder(): string | null {
        return this.getAttribute("placeholder");
    }

    public set placeholder(placeholder: string) {
        this.setAttribute("placeholder", placeholder);
    }

    public get contenidoBoton(): string | null {
        return this._contenidoBoton;
    }

    public set contenidoBoton(contenidoBoton: string) {
        this._contenidoBoton = contenidoBoton;
        this.actualizarContenidoBoton();
    }

    public get funcionBusqueda(): Function {
        return this._funcionBusqueda;
    }

    public set funcionBusqueda(funcionBusqueda: (event: HTMLInputElement) => void) {
        this._funcionBusqueda = funcionBusqueda;
    }

    static get observedAttributes() {
        return ['placeholder', "contenido-boton"];
    }

    attributeChangedCallback(nombre: string, _valorAntiguo: string, valor: string) {
        if (nombre == "placeholder") {
            this.actualizarPlaceHolder()
        } else if (nombre == "contenido-boton") {
            console.log("prueabs")
            this._contenidoBoton = valor;
            this.actualizarContenidoBoton();
        }
    }

    constructor() {
        super();
        this._funcionBusqueda = () => { };
        this._contenidoBoton = null;
    }

    connectedCallback() {
        this.append(template.content.cloneNode(true));

        if (this.hasAttribute("placeholder")) {
            this.actualizarPlaceHolder();
        }

        if (this.hasAttribute("contenido-boton")) {
            this.actualizarContenidoBoton()
        }

        let cuadro_busqueda = document.querySelector<HTMLInputElement>("#cuadro_busqueda");

        document.querySelector<HTMLButtonElement>("#boton_busqueda")?.addEventListener("click", () => {
            cuadro_busqueda?.dispatchEvent(new KeyboardEvent("keypress", { key: "Enter" }));
        })

        cuadro_busqueda?.addEventListener("keyup", function () {
            this.value = this.value.toLowerCase();
        });

        cuadro_busqueda?.addEventListener("keypress", (evento) => {
            if (evento.key == "Enter") {
                this._funcionBusqueda(cuadro_busqueda);
            }
        });
    }

    private actualizarPlaceHolder() {
        let input = this.querySelector<HTMLInputElement>("#cuadro_busqueda");

        if (input) {
            input.placeholder = this.getAttribute("placeholder") || "";
        }
    }

    private actualizarContenidoBoton() {
        let input = this.querySelector<HTMLInputElement>("#boton_busqueda");

        if (input) {
            console.log("Hola", this._contenidoBoton);
            input.innerHTML = this._contenidoBoton ? `<span>${this._contenidoBoton}</span>`: "";
        }
    }
}

customElements.define("header-busqueda", HeaderBusqueda);
