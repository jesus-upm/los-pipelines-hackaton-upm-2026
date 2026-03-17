"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useEffect } from "react";

const ubicacionesDisponibles = ["Madrid", "Barcelona", "Valencia", "Sevilla", "Malaga", "Bilbao"];

export default function BackofficePage() {
  const router = useRouter();
  const [ubicacionesAlerta, setUbicacionesAlerta] = useState<string[]>(["Madrid"]);
  const [ubicacionesRecomendacion, setUbicacionesRecomendacion] = useState<string[]>(["Madrid"]);
  const [autorizado, setAutorizado] = useState(false);
  const [nombreUsuario, setNombreUsuario] = useState("Usuario");

  const cerrarSesion = async () => {
    sessionStorage.removeItem("hackatonSession");
    router.replace("/");
  };

  useEffect(() => {
    const sesionRaw = sessionStorage.getItem("hackatonSession");
    if (!sesionRaw) {
      router.replace("/iniciar-sesion");
      return;
    }

    try {
      const sesion = JSON.parse(sesionRaw) as { tipoUsuario?: string; nombre?: string };
      if (sesion.tipoUsuario !== "Backoffice") {
        router.replace("/cliente");
        return;
      }
      const nombre = typeof sesion.nombre === "string" ? sesion.nombre.trim() : "";
      setNombreUsuario(nombre || "Usuario");
      setAutorizado(true);
    } catch {
      sessionStorage.removeItem("hackatonSession");
        router.replace("/iniciar-sesion");
    }
  }, [router]);

  const toggleUbicacion = (
    ubicacion: string,
    seleccionadas: string[],
    setSeleccionadas: React.Dispatch<React.SetStateAction<string[]>>,
  ) => {
    setSeleccionadas((actuales) =>
      actuales.includes(ubicacion) ? actuales.filter((item) => item !== ubicacion) : [...actuales, ubicacion],
    );
  };

  if (!autorizado) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,_#f8fafc_0%,_#eef2ff_48%,_#fff1f2_100%)] px-6 py-10 text-slate-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="grid gap-6 rounded-[2rem] bg-slate-950 p-8 text-white shadow-[0_25px_80px_rgba(15,23,42,0.25)] lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="space-y-4">
            <Link href="/" className="text-sm text-slate-300 transition hover:text-white">
              Volver al inicio
            </Link>
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Vista operativa</p>
              <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">Panel Backoffice</h1>
            </div>
            <p className="max-w-3xl text-base leading-8 text-slate-300">
              Desde aqui puedes emitir alertas generales y recomendaciones de seguridad para una o varias ubicaciones.
            </p>
          </div>

          <div className="rounded-[1.5rem] bg-white/10 px-5 py-4">
            <p className="text-sm text-slate-300">Responsable activo</p>
            <p className="mt-1 text-2xl font-bold">{nombreUsuario}</p>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-[2rem] border border-rose-200 bg-white/85 p-6 shadow-[0_15px_50px_rgba(15,23,42,0.08)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-rose-700">Emision de alertas</p>
                <h2 className="mt-2 text-3xl font-bold text-slate-950">Alerta para clientes</h2>
              </div>
              <span className="rounded-full bg-rose-100 px-3 py-1 text-sm font-semibold text-rose-900">
                Prioridad alta
              </span>
            </div>

            <div className="mt-5 grid gap-3 rounded-2xl bg-rose-50 p-4">
              <p className="text-sm font-semibold text-slate-700">Selecciona una o varias ubicaciones</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {ubicacionesDisponibles.map((ubicacion) => (
                  <label key={ubicacion} className="flex items-center gap-3 rounded-xl bg-white px-3 py-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={ubicacionesAlerta.includes(ubicacion)}
                      onChange={() => toggleUbicacion(ubicacion, ubicacionesAlerta, setUbicacionesAlerta)}
                      className="h-4 w-4"
                    />
                    {ubicacion}
                  </label>
                ))}
              </div>
            </div>

            <label className="mt-5 grid gap-2 text-sm font-medium text-slate-700">
              Mensaje de alerta
              <textarea
                rows={5}
                placeholder="Escribe la alerta general que recibirán los clientes de las ubicaciones seleccionadas"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-rose-400 focus:bg-white"
              />
            </label>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-600">
                Destino: {ubicacionesAlerta.length > 0 ? ubicacionesAlerta.join(", ") : "sin ubicaciones seleccionadas"}
              </p>
              <button className="rounded-2xl bg-rose-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-400">
                Emitir alerta
              </button>
            </div>
          </section>

          <section className="rounded-[2rem] border border-emerald-200 bg-white/85 p-6 shadow-[0_15px_50px_rgba(15,23,42,0.08)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-emerald-700">Recomendaciones</p>
                <h2 className="mt-2 text-3xl font-bold text-slate-950">Seguridad por zona</h2>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-900">
                Personalizable
              </span>
            </div>

            <div className="mt-5 grid gap-3 rounded-2xl bg-emerald-50 p-4">
              <p className="text-sm font-semibold text-slate-700">Selecciona una o varias ubicaciones</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {ubicacionesDisponibles.map((ubicacion) => (
                  <label key={ubicacion} className="flex items-center gap-3 rounded-xl bg-white px-3 py-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={ubicacionesRecomendacion.includes(ubicacion)}
                      onChange={() =>
                        toggleUbicacion(ubicacion, ubicacionesRecomendacion, setUbicacionesRecomendacion)
                      }
                      className="h-4 w-4"
                    />
                    {ubicacion}
                  </label>
                ))}
              </div>
            </div>

            <label className="mt-5 grid gap-2 text-sm font-medium text-slate-700">
              Recomendaciones de seguridad
              <textarea
                rows={5}
                placeholder="Define recomendaciones que se enviarán a los clientes de las zonas seleccionadas"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-400 focus:bg-white"
              />
            </label>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-600">
                Destino: {ubicacionesRecomendacion.length > 0 ? ubicacionesRecomendacion.join(", ") : "sin ubicaciones seleccionadas"}
              </p>
              <button className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400">
                Publicar recomendaciones
              </button>
            </div>
          </section>
        </section>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={cerrarSesion}
            className="rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-white"
          >
            Cerrar sesion
          </button>
        </div>
      </div>
    </main>
  );
}