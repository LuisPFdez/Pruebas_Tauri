import { tipos_pokemon } from "../assets/iconos";

let templateCuadro = document.createElement("template");

templateCuadro.innerHTML = `
<section class="tipo">
    <link rel="stylesheet" href="/src/components/cuadro-tipos.css" />
    <img width="30" height="30">
    <span></span>
</section>
`;

export class CuadroTipo extends HTMLElement {
    private _tipo: string;
    set tipo(tipo: string) {
        this._tipo = tipo;
        this.setAttribute("tipo", tipo);
    }

    get tipo(): string {
        return this._tipo;
    }

    set modoImagen(modoImagen: boolean) {
        if (modoImagen) {
            this.setAttribute("modo-imagen", "");
        } else {
            this.removeAttribute("modo-imagen");
        }
    }

    get modoImagen(): boolean {
        return this.hasAttribute("modo-imagen");
    }

    static get observedAttributes() {
        return ["tipo", "modo-imagen"];
    }

    constructor(tipo?: string, modoImagen?: boolean) {
        super();
        this._tipo = tipo || "normal";
        this.modoImagen = modoImagen || false;
    }

    attributeChangedCallback(name: string, _oldValue: string, newValue: string) {
        if(name == "tipo"){
            this._tipo = newValue;
            this.actualizarTipo(newValue);
        }

        this.actualizarModoImagen();
    }

    connectedCallback() {
        let shadow = this.attachShadow({ mode: "open" });
        shadow.append(templateCuadro.content.cloneNode(true));
        this.actualizarTipo(this._tipo);
        this.actualizarModoImagen();
    }

    actualizarTipo(tipo: string) {
        if (this.shadowRoot == null) return;

        let img = this.shadowRoot.querySelector<HTMLImageElement>("img")!;
        let section = this.shadowRoot.querySelector<HTMLElement>("section")!;

        let tipo_pokemon = tipos_pokemon[tipo];

        console.log("tipo", tipo);
        section.classList.add(tipo);
        section.title = `Tipo ${tipo_pokemon[1]}`;
        img.src = tipo_pokemon[0];
        img.alt = `Tipo ${tipo_pokemon[1]}`;
    }

    actualizarModoImagen() {
        if (this.shadowRoot == null) return;

        let span = this.shadowRoot.querySelector<HTMLSpanElement>("span") || document.createElement("span");
        let section = this.shadowRoot.querySelector<HTMLElement>("section")!;
        if (this.modoImagen) {
            section.style.width = "40px";
            section.style.height = "40px";
            section.style.gap = "0";
            span.remove();
        } else {
            section.style.width = "";
            section.style.height = "";
            section.style.gap = "";
            section.appendChild(span)
            span.innerText = tipos_pokemon[this._tipo][1];
        }
    }
}


customElements.define("cuadro-tipo", CuadroTipo);