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

export { tipos_pokemon, traduccion_tipos };

const tipos_pokemon: Record<string, string> = {
    "bug": bug,
    "dark": dark,
    "dragon": dragon,
    "electric": electric,
    "fairy": fairy,
    "fighting": fighting,
    "fire": fire,
    "flying": flying,
    "ghost": ghost,
    "grass": grass,
    "ground": ground,
    "ice": ice,
    "normal": normal,
    "poison": poison,
    "psychic": psychic,
    "rock": rock,
    "steel": steel,
    "water": water,
}

const traduccion_tipos: Record<string, string> = {
    "bug": "Bicho",
    "dark": "Siniestro",
    "dragon": "Dragon",
    "electric": "Electrico",
    "fairy": "Hada",
    "fighting": "Lucha",
    "fire": "Fuego",
    "flying": "Volador",
    "ghost": "Fantasma",
    "grass": "Planta",
    "ground": "Tierra",
    "ice": "Hielo",
    "normal": "Normal",
    "poison": "Veneno",
    "psychic": "Psíquico",
    "rock": "Roca",
    "steel": "Acero",
    "water": "Agua",
}