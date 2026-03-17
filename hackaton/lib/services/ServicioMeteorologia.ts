export const ServicioMeteorologia = async () => {
  try {
    const url = "http://ec2-54-171-51-31.eu-west-1.compute.amazonaws.com/weather";

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJqZXN1cyIsImV4cCI6MTc3MzgyMzM4MH0.m2YZVsFSXmhVOE54h_yMdiugogfHDifC2pvAghmin6o"}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`Error en la API: ${response.status}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error("Error al obtener datos meteorológicos:", error);
    return null;
  }
};