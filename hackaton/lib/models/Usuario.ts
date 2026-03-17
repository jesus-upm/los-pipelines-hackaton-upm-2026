export enum TipoVivienda { 
   Chalet = "Chalet",
   Piso = "Piso",
   PisoBajo = "Piso Bajo",
   Caravana = "Caravana",
   Residencia = "Residencia"
}

export class Usuario {
   // Atributos privados
   private static nextId: number = 1;
   private id: number;
   private nombre: string;
   private apellidos: string;
   private correo: string;
   private contraseña: string;
   private telefono: string;
   private provincia: string;
   private tipoVivienda: TipoVivienda;
   private necesidadesEspeciales: string;

   // Constructor para inicializar los atributos
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
      this.id = Usuario.nextId++;
      this.nombre = nombre;
      this.apellidos = apellidos;
      this.correo = correo;
      this.contraseña = contraseña;
      this.telefono = telefono;
      this.provincia = provincia;
      this.tipoVivienda = tipoVivienda;
      this.necesidadesEspeciales = necesidadesEspeciales;
   }

   // Métodos públicos
   public registrarse(): void {
      console.log("Usuario registrado con éxito.");
   }

   public visualizarMeteorologia(): void {
      console.log("Mostrando información meteorológica para la provincia:", this.provincia);
   }

   // Getters y setters
   public getNombre(): string { return this.nombre; }
   public setNombre(nombre: string): void { this.nombre = nombre; }

   public getApellidos(): string { return this.apellidos; }
   public setApellidos(apellidos: string): void { this.apellidos = apellidos; }

   public getCorreo(): string { return this.correo; }
   public setCorreo(correo: string): void { this.correo = correo; }

   public getContraseña(): string { return this.contraseña; }
   public setContraseña(contraseña: string): void { this.contraseña = contraseña; }

   public getTelefono(): string { return this.telefono; }
   public setTelefono(telefono: string): void { this.telefono = telefono; }

   public getProvincia(): string { return this.provincia; }
   public setProvincia(provincia: string): void { this.provincia = provincia; }

   public getTipoVivienda(): string { return this.tipoVivienda; }
   public setTipoVivienda(tipoVivienda: TipoVivienda): void { this.tipoVivienda = tipoVivienda; }

   public getNecesidadesEspeciales(): string { return this.necesidadesEspeciales; }
   public setNecesidadesEspeciales(necesidadesEspeciales: string): void { this.necesidadesEspeciales = necesidadesEspeciales; }
}