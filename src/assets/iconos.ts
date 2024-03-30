import bug from "./pokemon-type-icons/icons/bug.svg";
import dark from "./pokemon-type-icons/icons/dark.svg";
import dragon from "./pokemon-type-icons/icons/dragon.svg";
import electric from "./pokemon-type-icons/icons/electric.svg";
import fairy from "./pokemon-type-icons/icons/fairy.svg";
import fighting from "./pokemon-type-icons/icons/fighting.svg";
import fire from "./pokemon-type-icons/icons/fire.svg";
import flying from "./pokemon-type-icons/icons/flying.svg";
import ghost from "./pokemon-type-icons/icons/ghost.svg";
import grass from "./pokemon-type-icons/icons/grass.svg";
import ground from "./pokemon-type-icons/icons/ground.svg";
import ice from "./pokemon-type-icons/icons/ice.svg";
import normal from "./pokemon-type-icons/icons/normal.svg";
import poison from "./pokemon-type-icons/icons/poison.svg";
import psychic from "./pokemon-type-icons/icons/psychic.svg";
import rock from "./pokemon-type-icons/icons/rock.svg";
import steel from "./pokemon-type-icons/icons/steel.svg";
import water from "./pokemon-type-icons/icons/water.svg";

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