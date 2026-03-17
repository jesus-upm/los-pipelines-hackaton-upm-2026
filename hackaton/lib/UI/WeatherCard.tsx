
import { AICardProps } from "@/lib/services/ServicioIA";

export default function WeatherCard(dataProps : AICardProps) {
  const data = dataProps.data
  if (!data) return <div className="p-6 text-slate-500">Datos no disponibles</div>;

  // Mapeo de los campos importantes del JSON de Turís
  const ciudad = data.lugar; // "TURÍS"
  const tempActual = data.tmed; // "14,2"
  const tempMax = data.tmax; // "15,8"
  const tempMin = data.tmin; // "12,6"
  const lluvia = data.prec; // "1,7"
  const humedad = data.humedadMedia; // "70"

  return (
    <article className="rounded-[2rem] border border-sky-200 bg-white/85 p-6 shadow-[0_15px_50px_rgba(15,23,42,0.08)]">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-sky-700 font-medium">Forecast del día</p>
          <h2 className="mt-3 text-3xl font-bold text-slate-950">{ciudad}</h2>
        </div>
      </div>

      <div className="mt-5 rounded-2xl bg-sky-50 p-5">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-sm text-slate-600">Temp. Media</p>
            <p className="mt-1 text-5xl font-black text-slate-950">
              {tempActual}°C
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 font-bold uppercase">Lluvia</p>
            <p className="text-lg font-bold text-sky-600">{lluvia} mm</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-sky-100 flex justify-between">
          <div>
            <p className="text-[10px] uppercase text-slate-400 font-bold">Máxima</p>
            <p className="text-sm font-bold text-red-500">{tempMax}°C</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] uppercase text-slate-400 font-bold">Mínima</p>
            <p className="text-sm font-bold text-blue-500">{tempMin}°C</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase text-slate-400 font-bold">Humedad</p>
            <p className="text-sm font-bold text-slate-700">{humedad}%</p>
          </div>
        </div>
      </div>
    </article>
  );
}