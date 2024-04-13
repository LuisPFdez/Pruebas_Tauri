export function capitalizarPrimeraLetra(texto: string): string {
    return `${texto.charAt(0).toLocaleUpperCase()}${texto.slice(1)}`
}

