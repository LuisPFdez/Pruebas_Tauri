let templateHeader = document.createElement("template");

templateHeader.innerHTML = `
<header id="busqueda">
    <link rel="stylesheet" href="/src/components/header-busqueda.css" />
    <input type="text" id="cuadro_busqueda">
    <button id="boton_busqueda"></button>
</header>
`

class HeaderBusqueda extends HTMLElement {
    _funcionBusqueda: (event: HTMLInputElement) => void;

    public get placeholder(): string | null {
        return this.getAttribute("placeholder");
    }

    public set placeholder(placeholder: string) {
        this.setAttribute("placeholder", placeholder);
    }

    public get contenidoBoton(): string | null {
        return this.getAttribute("contenido-boton");
    }

    public set contenidoBoton(contenidoBoton: string) {
        this.setAttribute("contenido-boton", contenidoBoton);
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

    constructor() {
        super();
        this._funcionBusqueda = () => { };
    }

    attributeChangedCallback(nombre: string) {
        if (nombre == "placeholder") {
            this.actualizarPlaceHolder()
        } else if (nombre == "contenido-boton") {
            this.actualizarContenidoBoton();
        }
    }

    connectedCallback() {
        this.append(templateHeader.content.cloneNode(true));

        if (this.hasAttribute("placeholder")) {
            this.actualizarPlaceHolder();
        }

        if (this.hasAttribute("contenido-boton")) {
            this.actualizarContenidoBoton()
        }

        let cuadro_busqueda = document.querySelector<HTMLInputElement>("#cuadro_busqueda")!;

        document.querySelector<HTMLButtonElement>("#boton_busqueda")!.addEventListener("click", () => {
            cuadro_busqueda.dispatchEvent(new KeyboardEvent("keypress", { key: "Enter" }));
        })

        cuadro_busqueda.addEventListener("keyup", function () {
            this.value = this.value.toLowerCase();
        });

        cuadro_busqueda.addEventListener("keypress", (evento) => {
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
            input.innerHTML = this.getAttribute("contenido-boton") ? `<span>${this.getAttribute("contenido-boton")}</span>` : "";
        }
    }
}

customElements.define("header-busqueda", HeaderBusqueda);
