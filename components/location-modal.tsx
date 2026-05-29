"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Navigation, CheckCircle, Loader2 } from "lucide-react"

interface LocationModalProps {
  isOpen: boolean
  onLocationConfirmed: (city: string) => void
}

export function LocationModal({ isOpen, onLocationConfirmed }: LocationModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [selectedCity, setSelectedCity] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [cities] = useState([
    "São Paulo",
    "Rio de Janeiro",
    "Belo Horizonte",
    "Salvador",
    "Brasília",
    "Fortaleza",
    "Curitiba",
    "Recife",
    "Porto Alegre",
    "Manaus",
    "Belém",
    "Goiânia",
    "Guarulhos",
    "Campinas",
    "São Luís",
    "São Gonçalo",
    "Maceió",
    "Duque de Caxias",
    "Natal",
    "Teresina",
  ])

  // Função para obter localização do usuário
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords

          // Consulta API do OpenStreetMap (Nominatim)
          fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`)
            .then((response) => response.json())
            .then((data) => {
              const city = data.address.city || data.address.town || data.address.village || "São Paulo"
              setSelectedCity(city)
            })
            .catch(() => {
              setSelectedCity("São Paulo") // Fallback
            })
        },
        (error) => {
          console.warn("Erro ao pegar localização:", error)
          setSelectedCity("São Paulo") // Fallback
        },
      )
    }
  }

  // Executar ao abrir o modal
  useEffect(() => {
    if (isOpen) {
      getUserLocation()
    }
  }, [isOpen])

  const handleProcurarLoja = () => {
    if (!selectedCity) return

    setIsLoading(true)
    setStep(2)

    // Simula busca do serviço
    setTimeout(() => {
      setStep(3)
      setIsLoading(false)
    }, 2500)
  }

  const handleFecharModal = () => {
    onLocationConfirmed(selectedCity)
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="w-96 max-w-96 rounded-2xl border-0 shadow-2xl p-0" hideCloseButton>
        {/* Passo 1 - Seleção da cidade */}
        {step === 1 && (
          <div className="p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200 rounded-full">
              <MapPin className="w-6 h-6 text-orange-600" />
            </div>

            <h2 className="text-lg font-bold text-gray-800 mb-2">Estamos quase lá...</h2>
            <p className="text-gray-600 mb-5 text-sm">Confirme sua cidade:</p>

            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="h-11 text-sm bg-white border border-orange-200 rounded-xl focus:border-orange-500 mb-5">
                <SelectValue placeholder="Selecione sua cidade" />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={handleProcurarLoja}
              disabled={!selectedCity}
              className="w-full h-11 text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 bg-orange-600 hover:bg-orange-700 text-white disabled:bg-gray-300 disabled:text-gray-500"
            >
              <Navigation className="w-4 h-4 mr-2" />
              Procurar serviço!
            </Button>
          </div>
        )}

        {/* Passo 2 - Procurando loja */}
        {step === 2 && (
          <div className="p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 rounded-full">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            </div>

            <h2 className="text-lg font-bold text-gray-800 mb-2">Procurando serviço...</h2>
            <p className="text-gray-600 mb-4 text-sm">Buscando em {selectedCity}...</p>

            <div className="text-3xl mb-4">⏳</div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
              <p className="text-blue-700 text-sm">Aguarde...</p>
            </div>
          </div>
        )}

        {/* Passo 3 - Loja encontrada */}
        {step === 3 && (
          <div className="p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center bg-gradient-to-br from-green-100 to-green-200 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>

            <h2 className="text-lg font-bold text-gray-800 mb-2">✅ Serviço encontrado!</h2>

            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-5">
              <p className="text-green-800 text-sm">
                Serviço a <strong>2,5 km</strong> em {selectedCity}.
                <br />
                Entrega: <strong>30-50 min</strong>
              </p>
            </div>

            <Button
              onClick={handleFecharModal}
              className="w-full h-11 text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 bg-green-500 hover:bg-green-600 text-white"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Ver serviços!
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
