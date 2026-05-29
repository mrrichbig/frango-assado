// Serviço para detecção automática de localização
export interface LocationData {
  city: string
  state?: string
  country?: string
  latitude?: number
  longitude?: number
  source: "gps" | "ip" | "fallback"
}

// API de geolocalização por IP (fallback)
export async function getLocationByIP(): Promise<LocationData> {
  try {
    // Usando ipapi.co (gratuita, sem necessidade de API key)
    const response = await fetch("https://ipapi.co/json/", {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Falha na API de IP")
    }

    const data = await response.json()

    return {
      city: data.city || "São Paulo",
      state: data.region,
      country: data.country_name,
      latitude: data.latitude,
      longitude: data.longitude,
      source: "ip",
    }
  } catch (error) {
    console.error("Erro ao obter localização por IP:", error)

    // Fallback final
    return {
      city: "São Paulo",
      state: "SP",
      country: "Brasil",
      source: "fallback",
    }
  }
}

// Reverse geocoding para converter coordenadas em cidade
export async function reverseGeocode(latitude: number, longitude: number): Promise<LocationData> {
  try {
    // Usando API gratuita do OpenStreetMap Nominatim
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
      {
        headers: {
          "User-Agent": "DeliveryExpress/1.0",
        },
      },
    )

    if (!response.ok) {
      throw new Error("Falha no reverse geocoding")
    }

    const data = await response.json()
    const address = data.address || {}

    // Extrair cidade de diferentes campos possíveis
    const city =
      address.city || address.town || address.village || address.municipality || address.county || "São Paulo"

    return {
      city,
      state: address.state,
      country: address.country,
      latitude,
      longitude,
      source: "gps",
    }
  } catch (error) {
    console.error("Erro no reverse geocoding:", error)

    // Fallback para API de IP
    return await getLocationByIP()
  }
}

// Detecção via GPS do navegador
export function getCurrentPosition(): Promise<LocationData> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.log("Geolocalização não suportada, usando IP")
      getLocationByIP().then(resolve)
      return
    }

    const options = {
      enableHighAccuracy: false, // Mais rápido
      timeout: 5000, // 5 segundos apenas
      maximumAge: 300000, // Cache de 5 minutos
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          const locationData = await reverseGeocode(latitude, longitude)
          resolve(locationData)
        } catch (error) {
          console.error("Erro ao processar GPS:", error)
          const fallbackData = await getLocationByIP()
          resolve(fallbackData)
        }
      },
      async (error) => {
        console.log("GPS negado ou falhou, usando IP:", error.message)
        const fallbackData = await getLocationByIP()
        resolve(fallbackData)
      },
      options,
    )
  })
}
