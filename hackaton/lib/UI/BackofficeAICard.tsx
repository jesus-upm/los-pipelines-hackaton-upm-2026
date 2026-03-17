"use client";

import { AICardProps } from "@/lib/services/ServicioIA";
import { useEffect, useState } from "react";

export default function BackofficeAICard({ data }: AICardProps) {
  const [analisis, setAnalisis] = useState<string>("Analizando datos meteorológicos...");

  useEffect(() => {
    const getAnalisis = async () => {
      if (!data || data.tmed === "--") {
        setAnalisis("Datos meteorológicos no disponibles.");
        return;
      }

      const system_prompt =
        "Eres un experto en gestión de emergencias meteorológicas. Tu función es analizar datos meteorológicos y decidir si el operador debe activar una alerta de emergencia para los ciudadanos o no. Responde de forma directa y operativa. Empieza siempre con una recomendación clara: 'ACTIVAR ALERTA' o 'NO ACTIVAR ALERTA'. Luego en 2-3 líneas cortas explica el motivo. Cada punto en una nueva línea empezando con '·'. NO USES SIMBOLOS NI ENCABEZADOS extra.";

      const user_prompt = `Estoy en ${data.lugar}. Datos actuales: temperatura media ${data.tmed}°C, máxima ${data.tmax}°C, mínima ${data.tmin}°C, precipitación ${data.prec}mm, humedad media ${data.humedadMedia}%. ¿Debo activar una alerta de emergencia para los ciudadanos?`;

      try {
        const response = await fetch(`${window.location.origin}/api/prompt`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ system_prompt, user_prompt }),
          cache: "no-store",
        });

        if (!response.ok) {
          setAnalisis("Error al obtener el análisis de la IA.");
          return;
        }

        const returnData = await response.json();
        setAnalisis(returnData.response || "No se pudo generar un análisis.");
      } catch {
        setAnalisis("Problema de conexión con el servicio de IA.");
      }
    };

    getAnalisis();
  }, [data]);

  const esAlerta = analisis.toLowerCase().includes("activar alerta") && !analisis.toLowerCase().includes("no activar");

  return (
    <article
      className={`flex h-full flex-col rounded-[2rem] border p-6 shadow-[0_15px_50px_rgba(15,23,42,0.08)] ${
        esAlerta
          ? "border-red-300 bg-gradient-to-br from-red-900 to-orange-900"
          : "border-emerald-300 bg-gradient-to-br from-emerald-900 to-teal-900"
      } text-white`}
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="relative flex h-3 w-3">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${esAlerta ? "bg-red-400" : "bg-emerald-400"}`}
          ></span>
          <span
            className={`relative inline-flex h-3 w-3 rounded-full ${esAlerta ? "bg-red-500" : "bg-emerald-500"}`}
          ></span>
        </span>
        <p className={`text-xs font-bold uppercase tracking-[0.18em] ${esAlerta ? "text-red-300" : "text-emerald-300"}`}>
          Análisis IA · Decisión de alerta
        </p>
      </div>

      <h3 className="mb-2 text-xl font-semibold text-white">Recomendación operativa</h3>

      <p className={`text-sm italic leading-relaxed whitespace-pre-line ${esAlerta ? "text-red-100" : "text-emerald-100"}`}>
        {analisis}
      </p>
    </article>
  );
}
