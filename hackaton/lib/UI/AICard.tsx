// components/AICard.tsx
import { IAData, ServicioMeteorologiaPrompt } from "@/lib/services/ServicioIA"; // Ajusta la ruta a tu archivo de tipos


export default async function AICard(data : IAData) {
  const url = "http://ec2-54-171-51-31.eu-west-1.compute.amazonaws.com/prompt";
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJqZXN1cyIsImV4cCI6MTc3MzgyMzM4MH0.m2YZVsFSXmhVOE54h_yMdiugogfHDifC2pvAghmin6o"; // Considera mover esto a .env

  let aiConsejo: string | null = null;
  
  if (true  ) {
    const system_prompt = "Eres un experto meteorólogo que da consejos prácticos y cercanos. Tu respuesta debe ser concisa (máximo 2-3 frases).";
    const user_prompt = `dime hola`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ system_prompt, user_prompt }),
        next: { revalidate: 3600 } // Cachear la respuesta de la IA por 1 hora
      });


      if (!response.ok) {
        console.error("Error al llamar a la IA:", response.status);
        aiConsejo = "Error al obtener el consejo de la IA.";
      } else {
        const returnData = await response.json();
        aiConsejo = returnData.response || "No se pudo generar un consejo.";
      }
    } catch (error) {
      console.error("Error de red al llamar a la IA:", error);
      aiConsejo = "Problema de conexión con el servicio de IA.";
    }
  } else {
    aiConsejo = "Datos meteorológicos no disponibles para un consejo de IA.";
  }

  return (
    <article className="rounded-[2rem] border border-sky-200 bg-gradient-to-br from-blue-900 to-indigo-900 p-6 text-white shadow-[0_15px_50px_rgba(15,23,42,0.08)]">
      <div className="flex items-center gap-2 mb-3">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
        </span>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-300">Asistente IA</p>
      </div>
      
      <h3 className="text-xl font-semibold text-white mb-2">Consejo Meteorológico</h3>
      
      <p className="text-sm leading-relaxed text-blue-100 italic">
        {aiConsejo}
      </p>

      {/* Aquí podrías añadir un icono relevante al consejo si lo parseas */}
      {/* <div>
        <Image src="/ai-icon.svg" alt="AI Icon" width={32} height={32} className="mt-4 opacity-75" />
      </div> */}
    </article>
  );
}