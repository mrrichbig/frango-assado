"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { type LocationData, getCurrentPosition } from "@/lib/location-service"

interface LocationContextType {
  location: LocationData | null
  cidade: string
  isLoading: boolean
  error: string | null
  refreshLocation: () => Promise<void>
}

const LocationContext = createContext<LocationContextType | undefined>(undefined)

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useState<LocationData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const detectLocation = async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log("🌍 Iniciando detecção automática de localização...")

      const locationData = await getCurrentPosition()

      console.log("📍 Localização detectada:", locationData)

      setLocation(locationData)

      // Salvar no localStorage para próximas visitas
      localStorage.setItem("user-location", JSON.stringify(locationData))
    } catch (err) {
      console.error("❌ Erro na detecção de localização:", err)
      setError("Erro ao detectar localização")

      // Tentar carregar do localStorage como último recurso
      const saved = localStorage.getItem("user-location")
      if (saved) {
        try {
          const savedLocation = JSON.parse(saved)
          setLocation(savedLocation)
          console.log("💾 Usando localização salva:", savedLocation)
        } catch (parseError) {
          console.error("Erro ao carregar localização salva:", parseError)
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  const refreshLocation = async () => {
    await detectLocation()
  }

  useEffect(() => {
    // Detectar localização automaticamente quando o componente monta
    detectLocation()
  }, [])

  const cidade = location?.city || "São Paulo"

  const value: LocationContextType = {
    location,
    cidade,
    isLoading,
    error,
    refreshLocation,
  }

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>
}

export function useLocation() {
  const context = useContext(LocationContext)
  if (context === undefined) {
    throw new Error("useLocation deve ser usado dentro de LocationProvider")
  }
  return context
}

// Hook para acessar apenas a cidade (mais simples)
export function useCidade() {
  const { cidade } = useLocation()
  return cidade
}
