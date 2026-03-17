"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useEffect } from "react";
import ServicioMeteorologia from "@/lib/services/ServicioMeteorologia";
import WeatherCard from "@/lib/UI/WeatherCard";
import { IAData } from "@/lib/services/ServicioIA";
import { TipoVivienda } from "@/lib/models/Usuario";
import { db } from "@/lib/firebase";
import { addDoc, collection, getDocs, query, updateDoc, where, onSnapshot } from "firebase/firestore";

const dataInicial: IAData = {
  lugar: "--",
  tmed: "--",
  tmax: "--",
  tmin: "--",
  prec: "--",
  humedadMedia: "--",
  tipoVivienda: TipoVivienda.Piso,
  necesidadesEspeciales: ""
};

export default function BackofficePage() {
  const router = useRouter();
  const [autorizado, setAutorizado] = useState(false);
  const [nombreUsuario, setNombreUsuario] = useState("Usuario");
  const [dataIA, setDataIA] = useState<IAData>(dataInicial);
  const [mensajeAlerta, setMensajeAlerta] = useState("");
  const [guardandoAlerta, setGuardandoAlerta] = useState(false);
  const [mensajeResultado, setMensajeResultado] = useState("");
  const [alertaActiva, setAlertaActiva] = useState<{
    id: string;
    mensaje: string;
    emitidaEn: string;
    emitidaPor: string;
  } | null>(null);
  const [desactivando, setDesactivando] = useState(false);

  const cerrarSesion = async () => {
    sessionStorage.removeItem("hackatonSession");
    router.replace("/");
  };

  useEffect(() => {
    const cargarBackoffice = async () => {
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

        const rawData = await ServicioMeteorologia();
        if (rawData) {
          setDataIA({
            lugar: rawData.nombre ?? "--",
            tmed: rawData.tmed ?? "--",
            tmax: rawData.tmax ?? "--",
            tmin: rawData.tmin ?? "--",
            prec: rawData.prec ?? "--",
            humedadMedia: rawData.hrMedia ?? "--",
            tipoVivienda: TipoVivienda.Piso,
            necesidadesEspeciales: ""
          });
        }

        setAutorizado(true);
      } catch {
        sessionStorage.removeItem("hackatonSession");
        router.replace("/iniciar-sesion");
      }
    };

    cargarBackoffice();
  }, [router]);

  useEffect(() => {
    const alertasRef = collection(db, "alertas");
    const alertasActivasQuery = query(alertasRef, where("activa", "==", true));

    const unsub = onSnapshot(alertasActivasQuery, (snapshot) => {
      if (snapshot.empty) {
        setAlertaActiva(null);
        return;
      }

      const primerDoc = snapshot.docs[0];
      const data = primerDoc.data() as {
        mensaje?: string;
        emitidaEn?: string;
        emitidaPor?: string;
      };

      setAlertaActiva({
        id: primerDoc.id,
        mensaje: data.mensaje ?? "",
        emitidaEn: data.emitidaEn ?? "",
        emitidaPor: data.emitidaPor ?? "Backoffice",
      });
    });

    return () => unsub();
  }, []);

  const emitirAlerta = async () => {
    const mensaje = mensajeAlerta.trim();

    if (!mensaje) {
      setMensajeResultado("Debes escribir un mensaje de alerta.");
      return;
    }

    setGuardandoAlerta(true);
    setMensajeResultado("");

    try {
      const alertasRef = collection(db, "alertas");
      const activasQuery = query(alertasRef, where("activa", "==", true));
      const activasSnap = await getDocs(activasQuery);

      await Promise.all(
        activasSnap.docs.map((docSnap) => updateDoc(docSnap.ref, { activa: false })),
      );

      await addDoc(alertasRef, {
        mensaje,
        emitidaPor: nombreUsuario,
        emitidaEn: new Date().toISOString(),
        activa: true,
      });

      setMensajeAlerta("");
      setMensajeResultado("Alerta emitida y guardada correctamente.");
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      setMensajeResultado(`No se pudo guardar la alerta: ${msg}`);
    } finally {
      setGuardandoAlerta(false);
    }
  };

  const desactivarAlerta = async () => {
    if (!alertaActiva) return;

    setDesactivando(true);
    try {
      const alertasRef = collection(db, "alertas");
      const docRef = alertasRef.parent?.path ? await getDocs(query(alertasRef, where("__name__", "==", alertaActiva.id))) : null;
      
      const alertasQuery = query(alertasRef, where("activa", "==", true));
      const activasSnap = await getDocs(alertasQuery);
      
      const alertaDoc = activasSnap.docs.find((doc) => doc.id === alertaActiva.id);
      if (alertaDoc) {
        await updateDoc(alertaDoc.ref, { activa: false });
        setMensajeResultado("Alerta desactivada correctamente.");
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      setMensajeResultado(`Error al desactivar: ${msg}`);
    } finally {
      setDesactivando(false);
    }
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

        {alertaActiva && (
          <section className="rounded-[2rem] border-4 border-red-500 bg-gradient-to-r from-red-50 to-orange-50 p-6 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-700">⚠️ Alerta activa en el sistema</p>
                  <p className="mt-3 text-2xl font-black text-red-900">{alertaActiva.mensaje}</p>
                </div>
                <button
                  type="button"
                  onClick={desactivarAlerta}
                  disabled={desactivando}
                  className="whitespace-nowrap rounded-2xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {desactivando ? "Desactivando..." : "Desactivar"}
                </button>
              </div>
              <p className="text-xs text-slate-600">
                Emitida por {alertaActiva.emitidaPor} · {alertaActiva.emitidaEn || "sin fecha"}
              </p>
            </div>
          </section>
        )}

        <section className="grid gap-6 md:grid-cols-2">
          <div>
            <WeatherCard data={dataIA} />
          </div>

          <div className="rounded-[2rem] border border-rose-200 bg-white/85 p-6 shadow-[0_15px_50px_rgba(15,23,42,0.08)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-rose-700">Emision de alertas</p>
                <h2 className="mt-2 text-3xl font-bold text-slate-950">Alerta para clientes</h2>
              </div>
              <span className="rounded-full bg-rose-100 px-3 py-1 text-sm font-semibold text-rose-900">
                Prioridad alta
              </span>
            </div>

            <label className="mt-5 grid gap-2 text-sm font-medium text-slate-700">
              Mensaje de alerta
              <textarea
                rows={5}
                placeholder="Escribe la alerta general que recibirán todos los clientes"
                value={mensajeAlerta}
                onChange={(event) => setMensajeAlerta(event.target.value)}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-rose-400 focus:bg-white"
              />
            </label>

            {mensajeResultado ? <p className="mt-4 text-sm font-medium text-slate-700">{mensajeResultado}</p> : null}

            <div className="mt-5 flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                onClick={emitirAlerta}
                disabled={guardandoAlerta}
                className="rounded-2xl bg-rose-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {guardandoAlerta ? "Emitiendo..." : "Emitir alerta"}
              </button>
            </div>
          </div>
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