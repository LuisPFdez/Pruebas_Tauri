export class ErrorVentana extends Error {

    constructor(message: string) {
        super(message)
        this.name = "ErrorVentana";
    }
}