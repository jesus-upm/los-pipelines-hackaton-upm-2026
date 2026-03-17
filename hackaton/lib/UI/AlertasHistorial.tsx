"use client";

import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";

interface Alerta {
  id: string;
  mensaje: string;
  emitidaPor: string;
  emitidaEn: string;
}

export default function AlertasHistorial() {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    const alertasRef = collection(db, "alertas");
    const historialQuery = query(alertasRef, where("activa", "==", false));

    const unsub = onSnapshot(historialQuery, (snapshot) => {
      const docs = snapshot.docs.map((docSnap) => {
        const data = docSnap.data() as {
          mensaje?: string;
          emitidaPor?: string;
          emitidaEn?: string;
        };
        return {
          id: docSnap.id,
          mensaje: data.mensaje ?? "(sin mensaje)",
          emitidaPor: data.emitidaPor ?? "Desconocido",
          emitidaEn: data.emitidaEn ?? "",
        };
      });

      docs.sort((a, b) => (b.emitidaEn > a.emitidaEn ? 1 : -1));
      setAlertas(docs);
    });

    return () => unsub();
  }, []);

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white/70 shadow-[0_15px_50px_rgba(15,23,42,0.06)]">
      <button
        type="button"
        onClick={() => setAbierto((prev) => !prev)}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Historial de alertas</p>
          <p className="mt-1 text-xl font-bold text-slate-900">
            Alertas pasadas
            {alertas.length > 0 && (
              <span className="ml-2 rounded-full bg-slate-200 px-2 py-0.5 text-sm font-semibold text-slate-600">
                {alertas.length}
              </span>
            )}
          </p>
        </div>
        <span className={`text-slate-400 transition-transform duration-200 ${abierto ? "rotate-180" : ""}`}>
          ▼
        </span>
      </button>

      {abierto && (
        <div className="border-t border-slate-200 px-6 pb-6 pt-4">
          {alertas.length === 0 ? (
            <p className="text-sm text-slate-400">No hay alertas pasadas registradas.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {alertas.map((alerta) => (
                <li
                  key={alerta.id}
                  className="flex flex-col gap-1 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4"
                >
                  <p className="text-base font-semibold text-slate-800">{alerta.mensaje}</p>
                  <p className="text-xs text-slate-500">
                    Emitida por <span className="font-medium text-slate-700">{alerta.emitidaPor}</span>
                    {alerta.emitidaEn ? ` · ${new Date(alerta.emitidaEn).toLocaleString("es-ES")}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
