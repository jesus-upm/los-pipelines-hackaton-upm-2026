"use client";

import Link from "next/link";
import { useState } from "react";

import { addDoc, collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";

import { provincias } from "./provincias";
import { TipoVivienda, Usuario } from "@/lib/models/Usuario";
import { db } from "@/lib/firebase";

const tiposVivienda = Object.values(TipoVivienda);

export default function RegistroPage() {
  const [tipoUsuario, setTipoUsuario] = useState("Cliente");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleRegistro = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    setMensaje("");
    setCargando(true);

    const formData = new FormData(form);

    const nombre = String(formData.get("nombre") ?? "").trim();
    const apellidos = String(formData.get("apellidos") ?? "").trim();
    const correo = String(formData.get("correo") ?? "").trim();
    const contrasena = String(formData.get("contrasena") ?? "");
    const repetirContrasena = String(formData.get("repetirContrasena") ?? "");
    const telefono = String(formData.get("telefono") ?? "").trim();
    const provincia = String(formData.get("provincia") ?? "").trim();
    const tipoVivienda = String(formData.get("tipoVivienda") ?? "") as TipoVivienda;
    const necesidadesEspeciales = String(formData.get("necesidadesEspeciales") ?? "").trim();
    const codigoBackoffice = String(formData.get("codigoBackoffice") ?? "").trim();

    try {
      const usuariosRef = collection(db, "usuarios");
      const correoDuplicadoQuery = query(usuariosRef, where("correo", "==", correo));
      const correoDuplicadoSnap = await getDocs(correoDuplicadoQuery);
      if (!correoDuplicadoSnap.empty) {
        setMensaje("Ya existe un usuario registrado con ese correo.");
        setCargando(false);
        return;
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setMensaje(`No se pudo validar el correo en la base de datos: ${msg}`);
      setCargando(false);
      return;
    }

    if (contrasena !== repetirContrasena) {
      setMensaje("Las contrasenas no coinciden.");
      setCargando(false);
      return;
    }

    if (tipoUsuario === "Backoffice" && !codigoBackoffice) {
      setMensaje("Para Backoffice debes introducir el codigo de acceso.");
      setCargando(false);
      return;
    }

    if (tipoUsuario === "Backoffice") {
      try {
        const configRef = doc(db, "config", "backoffice");
        const configSnap = await getDoc(configRef);

        if (!configSnap.exists()) {
          setMensaje("No existe la configuracion de Backoffice en la base de datos.");
          setCargando(false);
          return;
        }

        const data = configSnap.data() as {
          codigo?: string;
          codigoAdmin?: string;
          codigoAdministrador?: string;
          adminCode?: string;
        };

        const codigoConfigurado =
          data.codigo ?? data.codigoAdmin ?? data.codigoAdministrador ?? data.adminCode ?? "";

        if (!codigoConfigurado) {
          setMensaje("El codigo de Backoffice no esta configurado en la base de datos.");
          setCargando(false);
          return;
        }

        if (codigoBackoffice !== codigoConfigurado) {
          setMensaje("Codigo de administrador incorrecto. No se puede crear una cuenta Backoffice.");
          setCargando(false);
          return;
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setMensaje(`No se pudo validar el codigo de Backoffice: ${msg}`);
        setCargando(false);
        return;
      }
    }

    const nuevoUsuario = new Usuario(
      nombre,
      apellidos,
      correo,
      contrasena,
      telefono,
      provincia,
      tipoVivienda,
      necesidadesEspeciales,
    );

    try {
      await addDoc(collection(db, "usuarios"), {
        nombre: nuevoUsuario.getNombre(),
        apellidos: nuevoUsuario.getApellidos(),
        correo: nuevoUsuario.getCorreo(),
        contrasena: contrasena,
        telefono: nuevoUsuario.getTelefono(),
        provincia: nuevoUsuario.getProvincia(),
        tipoVivienda: nuevoUsuario.getTipoVivienda(),
        necesidadesEspeciales: nuevoUsuario.getNecesidadesEspeciales(),
        tipoUsuario: tipoUsuario,
        creadoEn: new Date().toISOString(),
      });
      setMensaje(`Cuenta creada correctamente para ${nuevoUsuario.getNombre()}.`);
      form.reset();
      setTipoUsuario("Cliente");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setMensaje(`Error al guardar en la base de datos: ${msg}`);
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,_#fff7ed_0%,_#fffbeb_40%,_#f0f9ff_100%)] px-6 py-10 text-slate-900">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="flex flex-col justify-between rounded-[2rem] bg-slate-950 p-8 text-white shadow-[0_25px_80px_rgba(15,23,42,0.25)]">
          <div className="space-y-6">
            <Link href="/" className="inline-flex text-sm text-slate-300 transition hover:text-white">
              Volver al inicio
            </Link>
            <span className="inline-flex w-fit rounded-full border border-white/10 bg-white/10 px-4 py-1 text-sm font-medium text-amber-200">
              Alta de usuarios
            </span>
            <div className="space-y-4">
              <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
                Crea tu cuenta y prepara tu espacio de compra.
              </h1>
              <p className="max-w-lg text-base leading-8 text-slate-300">
                Estos datos serán utilizados para personalizar tu experiencia, ofrecer recomendaciones relevantes y garantizar tu seguridad.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/60 bg-white/85 p-8 shadow-[0_25px_80px_rgba(148,163,184,0.18)] backdrop-blur">
          <form className="grid gap-5" onSubmit={handleRegistro}>
            <div className="grid gap-5 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Nombre
                <input
                  name="nombre"
                  type="text"
                  placeholder="Lucia"
                  required
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-amber-400 focus:bg-white"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Apellidos
                <input
                  name="apellidos"
                  type="text"
                  placeholder="Garcia Ruiz"
                  required
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-amber-400 focus:bg-white"
                />
              </label>
            </div>

            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Correo electronico
              <input
                name="correo"
                type="email"
                placeholder="nombre@correo.com"
                required
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-amber-400 focus:bg-white"
              />
            </label>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Contrasena
                <input
                  name="contrasena"
                  type="password"
                  placeholder="Minimo 8 caracteres"
                  minLength={8}
                  required
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-amber-400 focus:bg-white"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Repetir contrasena
                <input
                  name="repetirContrasena"
                  type="password"
                  placeholder="Repite la contrasena"
                  minLength={8}
                  required
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-amber-400 focus:bg-white"
                />
              </label>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Telefono
                <input
                  name="telefono"
                  type="tel"
                  placeholder="600 123 456"
                  required
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-amber-400 focus:bg-white"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Tipo de usuario
                <select
                  name="tipoUsuario"
                  value={tipoUsuario}
                  onChange={(event) => setTipoUsuario(event.target.value)}
                  required
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-amber-400 focus:bg-white"
                >
                  <option>Cliente</option>
                  <option>Backoffice</option>
                </select>
              </label>
            </div>

            {tipoUsuario === "Backoffice" ? (
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Codigo de acceso Backoffice
                <input
                  name="codigoBackoffice"
                  type="text"
                  placeholder="Introduce el codigo recibido externamente"
                  required={tipoUsuario === "Backoffice"}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-amber-400 focus:bg-white"
                />
              </label>
            ) : null}

            <div className="grid gap-5 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Tipo de vivienda
                <select
                  name="tipoVivienda"
                  required
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-amber-400 focus:bg-white"
                >
                  <option value="">Selecciona un tipo</option>
                  {tiposVivienda.map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {tipo}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Provincia
                <select
                  name="provincia"
                  required
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-amber-400 focus:bg-white"
                >
                  <option value="">Selecciona una provincia</option>
                  {provincias.map((provincia) => (
                    <option key={provincia} value={provincia}>
                      {provincia}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Necesidades especiales
              <textarea
                name="necesidadesEspeciales"
                placeholder="Indica alergias, requisitos de accesibilidad o cualquier necesidad relevante"
                rows={4}
                required
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-amber-400 focus:bg-white"
              />
            </label>

            <label className="flex items-start gap-3 rounded-2xl bg-amber-50 px-4 py-4 text-sm text-slate-700">
              <input
                name="terminos"
                type="checkbox"
                required
                className="mt-1 h-4 w-4 rounded border-slate-300"
              />
              <span>
                Acepto los terminos del servicio y autorizo el uso de mis datos para la gestion de pedidos y comunicaciones.
              </span>
            </label>

            {mensaje ? <p className="text-sm font-medium text-slate-700">{mensaje}</p> : null}

            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <button
                type="submit"
                disabled={cargando}
                className="rounded-2xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {cargando ? "Creando cuenta..." : "Crear cuenta"}
              </button>
              <Link
                href="/iniciar-sesion"
                className="rounded-2xl border border-slate-200 px-6 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Ya tengo cuenta
              </Link>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}