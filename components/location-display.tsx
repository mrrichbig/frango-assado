"use client"

import { useLocation } from "@/contexts/location-context"
import { MapPin, Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LocationDisplayProps {
  showRefresh?: boolean
  showIcon?: boolean
  className?: string
  format?: "city-only" | "city-state" | "full"
}

export function LocationDisplay({
  showRefresh = false,
  showIcon = true,
  className = "",
  format = "city-only",
}: LocationDisplayProps) {
  const { location, cidade, isLoading, error, refreshLocation } = useLocation()

  if (isLoading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
        <span className="text-sm text-gray-500">Detectando localização...</span>
      </div>
    )
  }

  if (error && !location) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <MapPin className="w-4 h-4 text-red-500" />
        <span className="text-sm text-red-500">Erro na localização</span>
        {showRefresh && (
          <Button size="sm" variant="ghost" onClick={refreshLocation} className="p-1 h-auto">
            <RefreshCw className="w-3 h-3" />
          </Button>
        )}
      </div>
    )
  }

  const formatLocation = () => {
    if (!location) return cidade

    switch (format) {
      case "city-only":
        return cidade
      case "city-state":
        return location.state ? `${cidade}, ${location.state}` : cidade
      case "full":
        return location.state && location.country ? `${cidade}, ${location.state}, ${location.country}` : cidade
      default:
        return cidade
    }
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {showIcon && <MapPin className="w-4 h-4 text-orange-500" />}
      <span className="text-sm font-medium">{formatLocation()}</span>
      {showRefresh && (
        <Button
          size="sm"
          variant="ghost"
          onClick={refreshLocation}
          className="p-1 h-auto"
          title="Atualizar localização"
        >
          <RefreshCw className="w-3 h-3" />
        </Button>
      )}
      {location?.source && (
        <span className="text-xs text-gray-400 ml-1">
          ({location.source === "gps" ? "GPS" : location.source === "ip" ? "IP" : "Padrão"})
        </span>
      )}
    </div>
  )
}
