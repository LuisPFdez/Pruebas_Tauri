import bug from "./type-icons/bug.svg";
import dark from "./type-icons/dark.svg";
import dragon from "./type-icons/dragon.svg";
import electric from "./type-icons/electric.svg";
import fairy from "./type-icons/fairy.svg";
import fighting from "./type-icons/fighting.svg";
import fire from "./type-icons/fire.svg";
import flying from "./type-icons/flying.svg";
import ghost from "./type-icons/ghost.svg";
import grass from "./type-icons/grass.svg";
import ground from "./type-icons/ground.svg";
import ice from "./type-icons/ice.svg";
import normal from "./type-icons/normal.svg";
import poison from "./type-icons/poison.svg";
import psychic from "./type-icons/psychic.svg";
import rock from "./type-icons/rock.svg";
import steel from "./type-icons/steel.svg";
import water from "./type-icons/water.svg";

export { tipos_pokemon, traduccion_stats, abreviaturas_stats };

const tipos_pokemon: Record<string, [string, string]> = {
    "bug": [bug, "Bicho"],
    "dark": [dark, "Siniestro"],
    "dragon": [dragon, "Dragon"],
    "electric": [electric, "Electrico"],
    "fairy": [fairy, "Hada"],
    "fighting": [fighting, "Lucha"],
    "fire": [fire, "Fuego"],
    "flying": [flying, "Volador"],
    "ghost": [ghost, "Fantasma"],
    "grass": [grass, "Planta"],
    "ground": [ground, "Tierra"],
    "ice": [ice, "Hielo"],
    "normal": [normal, "Normal"],
    "poison": [poison, "Veneno"],
    "psychic": [psychic, "Psíquico"],
    "rock": [rock, "Roca"],
    "steel": [steel, "Acero"],
    "water": [water, "Agua"],
}

const traduccion_stats: Record<string, string> = {
    "hp": "PS",
    "attack": "Ataque",
    "defense": "Defensa",
    "special-attack": "Ataque Especial",
    "special-defense": "Defensa Especial",
    "speed": "Velocidad",
}

const abreviaturas_stats: Record<string, string> = {
    "hp": "PS",
    "attack": "A",
    "defense": "D",
    "special-attack": "AE",
    "special-defense": "DE",
    "speed": "V",
}