import { Usuario, TipoVivienda } from "./Usuario"; // Asumiendo que Usuario está en otro archivo

export class Ciudadano extends Usuario {
    // Constructor que llama al constructor de la clase padre
    constructor(
        nombre: string,
        apellidos: string,
        correo: string,
        contraseña: string,
        telefono: string,
        provincia: string,
        tipoVivienda: TipoVivienda,
        necesidadesEspeciales: string
    ) {
        super(nombre, apellidos, correo, contraseña, telefono, provincia, tipoVivienda, necesidadesEspeciales);
    }

    // Métodos propios de Ciudadano
    public mostrarAlerta(): void {
        console.log(`¡Alerta para el ciudadano en ${this.getProvincia()}!`);
    }

    public mostrarRecomendacionesSeguridad(): void {
        console.log(`Recomendaciones de seguridad para ${this.getProvincia()}:`);
        console.log("- Mantener la calma");
        console.log("- Seguir las indicaciones de las autoridades");
        console.log("- Evitar zonas de riesgo");
    }
}