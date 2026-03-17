"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function IniciarSesionPage() {
  const router = useRouter();
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const formData = new FormData(form);
    const correo = String(formData.get("correo") ?? "").trim();
    const contrasena = String(formData.get("contrasena") ?? "");

    setMensaje("");
    setCargando(true);

    try {
      const usuariosRef = collection(db, "usuarios");
      const q = query(usuariosRef, where("correo", "==", correo));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setMensaje("Correo o contraseña incorrectos.");
        return;
      }

      const usuarioValido = snapshot.docs.find((documento) => {
        const data = documento.data() as { contrasena?: string };
        return data.contrasena === contrasena;
      });

      if (!usuarioValido) {
        setMensaje("Correo o contraseña incorrectos.");
        return;
      }

      const userDoc = usuarioValido.data() as { tipoUsuario?: string; nombre?: string; correo?: string };
      if (userDoc.tipoUsuario !== "Cliente" && userDoc.tipoUsuario !== "Backoffice") {
        setMensaje("El perfil no tiene un tipo de usuario válido.");
        return;
      }

      const tipoUsuario = userDoc.tipoUsuario;

      sessionStorage.setItem(
        "hackatonSession",
        JSON.stringify({
          usuarioId: usuarioValido.id,
          correo: userDoc.correo ?? correo,
          nombre: userDoc.nombre ?? "Usuario",
          tipoUsuario,
          iniciadaEn: new Date().toISOString(),
        }),
      );

      router.push(tipoUsuario === "Backoffice" ? "/backoffice" : "/cliente");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setMensaje(`No se pudo iniciar sesion: ${msg}`);
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_24%),linear-gradient(180deg,_#eff6ff_0%,_#f8fafc_55%,_#fff7ed_100%)] px-6 py-10 text-slate-900">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-8 lg:grid-cols-2">
        <section className="mx-auto w-full max-w-2xl rounded-[2rem] border border-sky-100 bg-white/85 p-8 shadow-[0_25px_80px_rgba(59,130,246,0.12)] backdrop-blur sm:p-10">
          <Link href="/" className="text-sm text-slate-500 transition hover:text-slate-900">
            Volver al inicio
          </Link>
          <div className="mt-8 space-y-4">
            <span className="inline-flex rounded-full bg-sky-100 px-4 py-1 text-sm font-medium text-sky-900">
              Acceso seguro
            </span>
            <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
              Inicia sesion para continuar con tu operativa.
            </h1>
            <p className="max-w-md text-base leading-8 text-slate-600">
              Esta vista funciona como punto de entrada comun. Despues puedes redirigir segun el rol a cliente o backoffice.
            </p>
          </div>

        </section>

        <section className="mx-auto w-full max-w-2xl rounded-[2rem] bg-slate-950 p-8 text-white shadow-[0_25px_80px_rgba(15,23,42,0.28)] sm:p-10">
          <form className="grid gap-5" onSubmit={handleLogin}>
            <label className="grid gap-2 text-sm font-medium text-slate-200">
              Correo electronico
              <input
                name="correo"
                type="email"
                placeholder="usuario@dominio.es"
                required
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:bg-white/10"
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-slate-200">
              Contraseña
              <input
                name="contrasena"
                type="password"
                placeholder="Introduce tu contraseña"
                minLength={8}
                required
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:bg-white/10"
              />
            </label>

            <div className="flex items-center justify-between gap-4 text-sm text-slate-300">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="h-4 w-4" />
                Recordar sesion
              </label>
              <Link href="/registro" className="transition hover:text-white">
                Crear nueva cuenta
              </Link>
            </div>

            {mensaje ? <p className="text-sm font-medium text-amber-200">{mensaje}</p> : null}

            <div className="flex justify-center pt-3">
              <button
                type="submit"
                disabled={cargando}
                className="min-w-48 rounded-2xl bg-sky-400 px-6 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {cargando ? "Entrando..." : "Iniciar sesion"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}