"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import ServicioMeteorologia from "@/lib/services/ServicioMeteorologia";
import { IAData } from "@/lib/services/ServicioIA";
import AICard from "@/lib/UI/AICard";
import WeatherCard from "@/lib/UI/WeatherCard";
import { TipoVivienda } from "@/lib/models/Usuario";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";

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

export default function ClientePage() {
  const router = useRouter();
  const [autorizado, setAutorizado] = useState(false);
  const [nombreUsuario, setNombreUsuario] = useState("Usuario");
  const [zona, setZona] = useState("--");
  const [dataIA, setDataIA] = useState<IAData>(dataInicial);
  const [alertaActiva, setAlertaActiva] = useState<{
    mensaje: string;
    emitidaEn: string;
    emitidaPor: string;
  } | null>(null);

  useEffect(() => {
    const cargarVista = async () => {
      const sesionRaw = sessionStorage.getItem("hackatonSession");
      if (!sesionRaw) {
        router.replace("/iniciar-sesion");
        return;
      }

      let sesion: {
        nombre?: string;
        tipoUsuario?: string;
      };
      try {
        sesion = JSON.parse(sesionRaw) as { nombre?: string; tipoUsuario?: string };
      } catch {
        sessionStorage.removeItem("hackatonSession");
        router.replace("/iniciar-sesion");
        return;
      }

      if (sesion.tipoUsuario === "Backoffice") {
        router.replace("/backoffice");
        return;
      }

      if (sesion.tipoUsuario !== "Cliente") {
        sessionStorage.removeItem("hackatonSession");
        router.replace("/iniciar-sesion");
        return;
      }

      setNombreUsuario((sesion.nombre ?? "Usuario").trim() || "Usuario");

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
        setZona(rawData.nombre ?? "--");
      }

      setAutorizado(true);
    };

    cargarVista();
  }, [router]);

  useEffect(() => {
    const alertasRef = collection(db, "alertas");
    const alertasActivasQuery = query(alertasRef, where("activa", "==", true));

    const unsub = onSnapshot(alertasActivasQuery, (snapshot) => {
      if (snapshot.empty) {
        setAlertaActiva(null);
        return;
      }

      const alertas = snapshot.docs.map((docSnap) => {
        const data = docSnap.data() as {
          mensaje?: string;
          emitidaEn?: string;
          emitidaPor?: string;
        };

        return {
          mensaje: data.mensaje ?? "",
          emitidaEn: data.emitidaEn ?? "",
          emitidaPor: data.emitidaPor ?? "Backoffice",
        };
      });

      const ultimaAlerta = alertas.reduce((acumulada, actual) =>
        (actual.emitidaEn || "") > (acumulada.emitidaEn || "") ? actual : acumulada,
      );

      if (!ultimaAlerta.mensaje) {
        setAlertaActiva(null);
        return;
      }

      setAlertaActiva(ultimaAlerta);
    });

    return () => unsub();
  }, []);

  const cerrarSesion = async () => {
    sessionStorage.removeItem("hackatonSession");
    router.replace("/");
  };

  if (!autorizado) {
    return null;
  }


  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#f8fafc_0%,_#f0fdf4_45%,_#eff6ff_100%)] px-6 py-10 text-slate-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        {alertaActiva && (
          <section className="rounded-[2rem] border-4 border-red-700 bg-gradient-to-r from-red-600 via-red-500 to-orange-600 p-8 shadow-[0_0_80px_rgba(220,38,38,0.8),0_0_40px_rgba(220,38,38,0.5)] ring-4 ring-red-300">
            <div className="space-y-4 text-center">
              <p className="text-3xl font-black uppercase tracking-[0.4em] text-white drop-shadow-2xl">🚨 ¡ALERTA GENERAL! 🚨</p>
              <p className="text-4xl font-black text-white drop-shadow-2xl">{alertaActiva.mensaje}</p>
              <p className="text-base font-bold text-white drop-shadow-lg">
                ⚠️ Emitida por {alertaActiva.emitidaPor}
              </p>
            </div>
          </section>
        )}

        <header className="rounded-[2rem] bg-slate-950 px-8 py-7 text-white shadow-[0_25px_80px_rgba(15,23,42,0.22)]">
          <div className="space-y-4">
            <Link href="/" className="text-sm text-slate-300 transition hover:text-white">
              Volver al inicio
            </Link>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
              {`¡Bienvenido, ${nombreUsuario}!`}
            </h1>
            <p className="max-w-3xl text-base leading-8 text-slate-300">
              Aqui tienes el resumen meteorologico del dia y recomendaciones de seguridad segun tu zona.
            </p>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          <WeatherCard data = {dataIA} />
          <AICard data={dataIA} />
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