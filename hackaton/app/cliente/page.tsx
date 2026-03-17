import Link from "next/link";

import {ServicioMeteorologia} from '@/lib/services/ServicioMeteorologia';
import { IAData } from '@/lib/services/ServicioIA';
import AICard from '@/lib/UI/AICard';
import { Usuario } from "@/lib/models/Usuario";

const usuario = "Lucia";
const zona = "Madrid";

export default function ClientePage() {

  const rawData = await ServicioMeteorologia();


  const dataIA: IAData = {
    lugar: rawData.nombre,
    tmed: rawData.tmed,
    tmax: rawData.tmax,
    tmin: rawData.tmin,
    prec: rawData.prec,
    humedadMedia: rawData.hrMedia,
    usuario: Usuario =
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#f8fafc_0%,_#f0fdf4_45%,_#eff6ff_100%)] px-6 py-10 text-slate-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="rounded-[2rem] bg-slate-950 px-8 py-7 text-white shadow-[0_25px_80px_rgba(15,23,42,0.22)]">
          <div className="space-y-4">
            <Link href="/" className="text-sm text-slate-300 transition hover:text-white">
              Volver al inicio
            </Link>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
              {`¡Bienvenido, ${usuario}!`}
            </h1>
            <p className="max-w-3xl text-base leading-8 text-slate-300">
              Aqui tienes el resumen meteorologico del dia y recomendaciones de seguridad segun tu zona.
            </p>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          
                  
          <WeatherCard data = {dataIA} />
          <AICard data={dataIA} />
          
          <article className="rounded-[2rem] border border-emerald-200 bg-white/85 p-6 shadow-[0_15px_50px_rgba(15,23,42,0.08)]">
            <p className="text-sm uppercase tracking-[0.18em] text-emerald-700">Recomendaciones de seguridad</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-950">Zona: {zona}</h2>
            <ul className="mt-5 grid gap-3">
              <li className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-slate-700">
                Lleva paraguas y evita zonas con acumulacion de agua en horas punta.
              </li>
              <li className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-slate-700">
                Si te desplazas en coche, reduce la velocidad y aumenta la distancia de seguridad.
              </li>
              <li className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-slate-700">
                Mantente atento a posibles avisos oficiales durante la tarde.
              </li>
            </ul>
          </article>
        </section>
      </div>
    </main>
  );
}