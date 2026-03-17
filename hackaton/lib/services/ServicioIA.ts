import { TipoVivienda, Usuario } from "../models/Usuario";

export interface IAData {
  lugar: string;
  tmed: string; // Temperatura media
  tmax: string; // Temperatura máxima
  tmin: string; // Temperatura mínima
  prec: string; // Precipitación
  humedadMedia: string; // Humedad relativa media
  tipoVivienda: TipoVivienda;
  necesidadesEspeciales: string;
  // Agrega más campos si son relevantes para el prompt de la IA
}

interface AICardProps {
  data: IAData; // Aquí le decimos que recibirá una prop llamada 'data'
}

export const ServicioMeteorologiaPrompt = async (systemPrompt: String, userPrompt: String) => {
  try {
    const url = "http://ec2-54-171-51-31.eu-west-1.compute.amazonaws.com/prompt";
    
    const body = {
      system_prompt: systemPrompt,
      user_prompt: userPrompt
        };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJqZXN1cyIsImV4cCI6MTc3MzgyMzM4MH0.m2YZVsFSXmhVOE54h_yMdiugogfHDifC2pvAghmin6o"}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`Error en la API: ${response.status}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error("Error al enviar el prompt meteorológico:", error);
    return null;
  }
};