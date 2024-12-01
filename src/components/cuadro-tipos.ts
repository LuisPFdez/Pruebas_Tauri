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
        console.log(this.hasAttribute("modo-imagen"));
        return this.hasAttribute("modo-imagen");
    }

    set cambiarOnHover(cambiarModoOnHover: boolean) {
        if (cambiarModoOnHover) {
            this.setAttribute("cambiar-on-hover", "");
        } else {
            this.removeAttribute("cambiar-on-hover");
        }
    }

    get cambiarOnHover(): boolean {
        console.log(this.hasAttribute("cambiar-on-hover"));
        return this.hasAttribute("cambiar-on-hover");
    }

    static get observedAttributes() {
        return ["tipo", "modo-imagen", "cambiar-on-hover"];
    }

    constructor(tipo?: string, modoImagen?: boolean, cambiarOnHover?: boolean) {
        super();
        this._tipo = tipo || "normal";
        this.modoImagen = modoImagen || this.modoImagen;
        this.cambiarOnHover = cambiarOnHover || this.cambiarOnHover;
    }

    attributeChangedCallback(name: string, _oldValue: string, newValue: string) {
        if (name == "tipo") {
            this._tipo = newValue;
            this.actualizarTipo(newValue);
        }

        this.actualizarModoImagen();
    }

    connectedCallback() {
        console.log("Hola");
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
        
        img.src = tipo_pokemon[0];
        img.alt = `Tipo ${tipo_pokemon[1]}`;
    }

    actualizarModoImagen() {
        if (this.shadowRoot == null) return;
        let tipo_pokemon = tipos_pokemon[this._tipo];

        let span = this.shadowRoot.querySelector<HTMLSpanElement>("span") || document.createElement("span");
        let section = this.shadowRoot.querySelector<HTMLElement>("section")!;
        if (this.modoImagen) {
            if(this.cambiarOnHover) {
                console.log("1")
                section.appendChild(span);
                span.innerText = tipo_pokemon[1];
                section.classList.add("cambioOnHover");
            } else {
                section.title = `Tipo ${tipo_pokemon[1]}`;
                span.remove();
                section.classList.remove("cambioOnHover");
            }
        } else {
            console.log("3")
            //En principio por 
            section.appendChild(span)
            span.innerText = tipos_pokemon[this._tipo][1];
        }
    }
}


customElements.define("cuadro-tipo", CuadroTipo);