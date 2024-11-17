/**
 * Intefaces de la api de pokeapi. 
 * No estan todas ni totalmente definidas.
 * https://pokeapi.co/docs/v2
*/

/**
 * Interfaz que referencia a otra parte de la api a traves de una url.
 * Contiene el nombre del recurso referenciado. Recibe un generico que indica a 
 * que interfaz hace refererencia. En caso de no estar definida, pasar unknown como generico
 */
interface NamedAPIResource<T> {
    readonly type: T;
    name: string;
    url: string;
}

interface EvolutionChain {
    id: number;
    chain: Chain;
}

interface Chain {
    is_baby: boolean;
    species: NamedAPIResource<PokemonSpecies>;
    evolution_details: Array<unknown>;
    evolves_to: Array<Chain>;
}

interface Pokemon {
    id: number;
    name: string;
    forms: NamedAPIResource<unknown>;
    sprites: PokemonSprites;
    cries: PokemonCries;
    types: Array<PokemonType>;
}

interface PokemonCries {
    latest: string;
    legacy: string;
}

interface PokemonSprites {
    back_default: string;
    back_female: string;
    back_shiny: string;
    back_shiny_female: string;
    front_default: string;
    front_female: string;
    front_shiny: string;
    front_shiny_female?: string;
}

interface PokemonFormSprites {
    front_default: string;
    front_shiny: string;
    back_default: string;
    back_shiny: string;
}

interface PokemonType {
    slot: number;
    type: NamedAPIResource<unknown>;
}

interface PokemonSpecies {
    id: number;
    name: string;
    order: number;
    gender_rate: number;
    is_baby: boolean;
    is_legendary: boolean;
    is_mythical: boolean;
    has_gender_differences: boolean;
    forms_switchable: boolean;
    varieties: Array<PokemonSpeciesVariety>;
    flavor_text_entries: Array<FlavorText>;
}

interface PokemonSpeciesVariety {
    is_default: boolean;
    pokemon: NamedAPIResource<Pokemon>;
}

interface FlavorText {
    flavor_text: string;
    language: NamedAPIResource<unknown>;
    version: NamedAPIResource<unknown>;
}

interface PokemonForm {
    name: string;
    form_name: string;
    is_battle_only: boolean;
    is_mega: boolean;
    pokemon: NamedAPIResource<Pokemon>;
    types: Array<PokemonType>;
    sprites: PokemonFormSprites;
}