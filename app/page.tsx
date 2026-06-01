"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ShoppingCart,
  Plus,
  Minus,
  Star,
  CheckCircle,
  Quote,
  Coins,
  ArrowLeft,
  Bike,
  Flame,
  Crown,
  MapPin,
  Clock,
} from "lucide-react"
import Image from "next/image"
import { LocationModal } from "@/components/location-modal"
import { useLocation } from "@/contexts/location-context"

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
}

interface Address {
  state: string
  city: string
  street: string
  number: string
  neighborhood: string
  complement: string
  cep: string
}

interface Review {
  name: string
  comment: string
}

interface ProductCustomization {
  spicyLevel: number
  extraSauce: number
  withoutSkin: number
  extraSides: number
  details: string
  includeCutlery: boolean
  includeNapkin: boolean
}

interface LocationData {
  city: string
  state: string
  neighborhood?: string
  latitude: number
  longitude: number
}

export default function DeliveryExpressApp() {
  const [showLocationModal, setShowLocationModal] = useState(true) // Show modal on load
  const [currentSection, setCurrentSection] = useState<"products" | "cart" | "customize" | "rating">("products")
  const [activeTab, setActiveTab] = useState<"produtos" | "acompanhamentos">("produtos")
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [address, setAddress] = useState<Address>({
    state: "",
    city: "",
    street: "",
    number: "",
    neighborhood: "",
    complement: "",
    cep: "",
  })
  const [locationData, setLocationData] = useState<LocationData | null>(null)
  const [hasAddress, setHasAddress] = useState(false) // Start as false until location is confirmed
  const [cart, setCart] = useState<CartItem[]>([])
  const [observations, setObservations] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [userRating, setUserRating] = useState(0)
  const [userComment, setUserComment] = useState("")
  const [showRatingSuccess, setShowRatingSuccess] = useState(false)
  const [customization, setCustomization] = useState<ProductCustomization>({
    spicyLevel: 0,
    extraSauce: 0,
    withoutSkin: 0,
    extraSides: 0,
    details: "",
    includeCutlery: false,
    includeNapkin: false,
  })
  const [userCity, setUserCity] = useState("São Paulo") // Default city
  const [currentTime, setCurrentTime] = useState(new Date())

  const [currentReviewIndex, setCurrentReviewIndex] = useState(0)

  const reviews: Review[] = [
    { name: "Carlos Silva", comment: "Excelente serviço! Entrega rápida e atendimento de qualidade." },
    { name: "Maria Santos", comment: "Chegou no tempo certo e em perfeitas condições. Recomendo!" },
    { name: "João Pedro", comment: "Atendimento perfeito, entrega pontual. Virou meu favorito!" },
    { name: "Ana Beatriz", comment: "Serviço de primeira qualidade, sempre cumprem o prazo." },
    { name: "Roberto Lima", comment: "Entrega rápida e atendimento excelente. Super recomendo!" },
    { name: "Fernanda Costa", comment: "Qualidade excepcional, como sempre esperamos. Perfeito!" },
    { name: "Lucas Oliveira", comment: "Melhor custo-benefício da cidade. Serviço top!" },
    { name: "Juliana Rocha", comment: "Atendimento especial, você sente o cuidado no serviço." },
    { name: "Pedro Henrique", comment: "Serviço na perfeição. Não troco por nenhum outro!" },
    { name: "Camila Ferreira", comment: "Chegou bem organizado e dentro do prazo prometido." },
  ]

  const promoProducts = [
    {
      id: "promo1",
      name: "Serviço Premium",
      price: 24.99,
      originalPrice: 34.99,
      image: "/placeholder.svg?height=64&width=64",
      description: "Serviço completo com atendimento especializado",
      isPromo: true,
    },
    {
      id: "promo2",
      name: "Pacote Família",
      price: 49.99,
      originalPrice: 69.99,
      image: "/placeholder.svg?height=64&width=64",
      description: "Solução completa para toda a família",
      isPromo: true,
      isHighlight: true, // Destaque especial
    },
    {
      id: "promo3",
      name: "Combo Básico",
      price: 18.99,
      originalPrice: 26.99,
      image: "/placeholder.svg?height=64&width=64",
      description: "Pacote essencial com tudo que você precisa",
      isPromo: true,
    },
  ]

  const handleLocationConfirmed = (city: string) => {
    setUserCity(city)
    setHasAddress(true)
    setShowLocationModal(false)
  }

  const handleProductClick = async (product: any) => {
    // Scroll para o topo da página
    window.scrollTo({ top: 0, behavior: "smooth" })

    setSelectedProduct(product)
    setCurrentSection("customize")
    setCustomization({
      spicyLevel: 0,
      extraSauce: 0,
      withoutSkin: 0,
      extraSides: 0,
      details: "",
      includeCutlery: false,
      includeNapkin: false,
    })
  }

  const addToCart = (product: any) => {
    const existingItem = cart.find((item) => item.id === product.id)
    if (existingItem) {
      setCart(cart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)))
    } else {
      setCart([
        ...cart,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          image: product.image,
        },
      ])
    }
  }

  const updateQuantity = (id: string, change: number) => {
    setCart(
      cart
        .map((item) => {
          if (item.id === id) {
            const newQuantity = item.quantity + change
            return newQuantity > 0 ? { ...item, quantity: newQuantity } : item
          }
          return item
        })
        .filter((item) => item.quantity > 0),
    )
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const updateCustomization = (field: keyof ProductCustomization, value: number | string | boolean) => {
    setCustomization((prev) => ({ ...prev, [field]: value }))
  }

  const handleFinalizePurchase = () => {
    if (selectedProduct) {
      addToCart(selectedProduct)
      window.scrollTo({ top: 0, behavior: "smooth" })
      setCurrentSection("products")
      setSelectedProduct(null)
    }
  }

  const handleSubmitRating = () => {
    if (userRating === 0) return

    setShowRatingSuccess(true)
    setTimeout(() => {
      setShowRatingSuccess(false)
      setCurrentSection("products")
      setUserRating(0)
      setUserComment("")
    }, 2000)
  }

  const generateWhatsAppMessage = () => {
    const items = cart
      .map((item) => `${item.quantity}x ${item.name} - R$ ${(item.price * item.quantity).toFixed(2)}`)
      .join("\n")

    const message = `📦 *Pedido Delivery Express*\n\n*Serviços:*\n${items}\n\n*Total: R$ ${getTotalPrice().toFixed(2)}*\n\n*Cidade:* ${userCity}\n\nObrigado!`

    return `https://wa.me/5511999999999?text=${encodeURIComponent(message)}`
  }

  const cidade = userCity // Use the selected city
  const { location } = useLocation()

  const getDeliveryTime = () => {
    const orderTime = new Date()
    const startTime = new Date(orderTime.getTime() + 30 * 60000) // +30 minutos
    const endTime = new Date(orderTime.getTime() + 50 * 60000) // +50 minutos

    return {
      start: startTime.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      end: endTime.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentReviewIndex((prevIndex) => (prevIndex === reviews.length - 1 ? 0 : prevIndex + 1))
    }, 5000)

    return () => clearInterval(interval)
  }, [reviews.length])

  const validateCustomization = () => {
    if (customization.spicyLevel === 0) {
      alert("Por favor, escolha como você prefere seu serviço!")
      return false
    }
    return true
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 overflow-y-auto">
      <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-red-500 to-orange-500 text-white py-2 z-50 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap">
          <div className="inline-flex items-center space-x-2 px-4">
            <Flame className="w-4 h-4 text-white" />
            <span className="text-sm font-bold">O MELHOR SERVIÇO DA REGIÃO</span>
            <span className="mx-8">•</span>
            <Flame className="w-4 h-4 text-white" />
            <span className="text-sm font-bold">GARANTIA DE QUALIDADE E PONTUALIDADE</span>
            <span className="mx-8">•</span>
            <Flame className="w-4 h-4 text-white" />
            <span className="text-sm font-bold">O MELHOR SERVIÇO DA REGIÃO</span>
            <span className="mx-8">•</span>
            <Flame className="w-4 h-4 text-white" />
            <span className="text-sm font-bold">GARANTIA DE QUALIDADE E PONTUALIDADE</span>
          </div>
        </div>
      </div>

      {/* Location Modal */}
      <LocationModal isOpen={showLocationModal} onLocationConfirmed={handleLocationConfirmed} />

      {/* Back Button - Fixed Position */}
      {currentSection !== "products" && (
        <Button
          onClick={() => {
            if (currentSection === "customization") {
              setCurrentSection("products")
            } else if (currentSection === "cart") {
              setCurrentSection("products")
            } else if (currentSection === "rating") {
              setCurrentSection("products")
            } else if (currentSection === "location") {
              setCurrentSection("products")
            }
          }}
          className="fixed top-6 left-4 z-50 bg-white text-orange-500 rounded-full px-4 py-2 flex items-center gap-2 shadow-lg hover:bg-gray-50 transition-all duration-300 border border-orange-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">VOLTAR</span>
        </Button>
      )}

      {/* Rating Section */}
      {currentSection === "rating" && hasAddress && (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 pb-24">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-b-3xl p-4 mb-6">
            <div className="text-center pt-12">
              <h1 className="text-2xl font-bold text-white mb-1">AVALIE NOSSO SERVIÇO</h1>
              <p className="text-lg text-yellow-300 font-script italic">sua opinião é importante</p>
            </div>
          </div>

          {/* Rating Content */}
          <div className="px-4 max-w-lg mx-auto">
            {!showRatingSuccess ? (
              <>
                {/* Rating Stars */}
                <Card className="bg-white rounded-2xl shadow-lg mb-6">
                  <CardContent className="p-6 text-center">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Como foi sua experiência?</h3>

                    <div className="flex justify-center space-x-2 mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setUserRating(star)}
                          className="transition-all duration-200 hover:scale-110"
                        >
                          <Star
                            className={`w-10 h-10 ${
                              star <= userRating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>

                    {userRating > 0 && (
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-2">
                          {userRating === 5 && "Excelente! 🎉"}
                          {userRating === 4 && "Muito bom! 👍"}
                          {userRating === 3 && "Bom! 😊"}
                          {userRating === 2 && "Regular 😐"}
                          {userRating === 1 && "Precisa melhorar 😔"}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Comment Section */}
                {userRating > 0 && (
                  <Card className="bg-white rounded-2xl shadow-lg mb-6">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-bold text-gray-800 mb-4">Deixe um comentário (opcional)</h3>
                      <textarea
                        placeholder="Conte-nos mais sobre sua experiência..."
                        value={userComment}
                        onChange={(e) => setUserComment(e.target.value)}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl resize-none h-24 text-sm focus:border-orange-400 focus:outline-none"
                        maxLength={200}
                      />
                      <p className="text-xs text-gray-500 mt-2">{userComment.length}/200 caracteres</p>
                    </CardContent>
                  </Card>
                )}

                {/* Submit Button */}
                {userRating > 0 && (
                  <div className="fixed bottom-6 left-4 right-4">
                    <Button
                      onClick={handleSubmitRating}
                      className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white px-10 py-4 rounded-full font-bold text-base shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <Star className="w-4 h-4" />
                        <span>AVALIAR SERVIÇO</span>
                      </div>
                    </Button>
                  </div>
                )}
              </>
            ) : (
              /* Success Message */
              <Card className="bg-white rounded-2xl shadow-lg">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Obrigado!</h3>
                  <p className="text-gray-600 mb-4">Sua avaliação foi enviada com sucesso.</p>
                  <div className="flex justify-center space-x-1">
                    {[...Array(userRating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Product Customization Section */}
      {currentSection === "customize" && selectedProduct && hasAddress && (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 pb-24">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-b-3xl p-4 mb-4">
            <div className="flex items-center justify-between mb-4 pt-12">
              <div></div>
            </div>

            {/* Product Image - Enhanced */}
            <div className="bg-white/20 rounded-3xl p-4 relative overflow-hidden">
              <div className="relative">
                <div className="w-full h-80 rounded-xl overflow-hidden mb-4 shadow-lg">
                  <Image
                    src="/placeholder.svg?height=600&width=600"
                    alt="Serviço Premium"
                    width={600}
                    height={600}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="px-4 mb-6">
            <h2 className="text-lg font-bold text-gray-800 text-center mb-1">{selectedProduct.name}</h2>
            <p className="text-sm text-gray-600 text-center mb-4">Serviço personalizado conforme sua necessidade</p>

            {/* Organizing preços na mesma linha */}
            <div className="text-center mb-4">
              <div className="flex items-center justify-center space-x-2">
                <span className="text-sm text-gray-500">de</span>
                <span className="text-lg text-gray-400 line-through">
                  R$ {selectedProduct.originalPrice.toFixed(2)}
                </span>
                <span className="text-sm text-gray-500">por</span>
                <span className="text-3xl font-bold text-green-600">R$ {selectedProduct.price.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Customization Options */}
          <div className="px-4 space-y-4">
            {/* Service Preference */}
            <Card className="bg-gray-200 rounded-2xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm">Como você prefere seu serviço hoje?</h3>
                    <p className="text-xs text-gray-600">Escolha a modalidade ideal</p>
                  </div>
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Option 1 - Padrão */}
                  <div
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      customization.spicyLevel === 1 ? "border-orange-500 bg-orange-50" : "border-gray-300 bg-white"
                    }`}
                    onClick={() => updateCustomization("spicyLevel", 1)}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-lg">📦</span>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800 text-sm mb-1">Serviço Padrão</h4>
                        <p className="text-xs text-gray-600">Atendimento completo e eficiente</p>
                      </div>
                      {customization.spicyLevel === 1 && (
                        <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Option 2 - Express */}
                  <div
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      customization.spicyLevel === 2 ? "border-orange-500 bg-orange-50" : "border-gray-300 bg-white"
                    }`}
                    onClick={() => updateCustomization("spicyLevel", 2)}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-lg">⚡</span>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800 text-sm mb-1">Serviço Express</h4>
                        <p className="text-xs text-gray-600">Atendimento rápido e prático</p>
                      </div>
                      {customization.spicyLevel === 2 && (
                        <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Option 3 - Premium */}
                  <div
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all relative ${
                      customization.spicyLevel === 3 ? "border-orange-500 bg-orange-50" : "border-gray-300 bg-white"
                    }`}
                    onClick={() => updateCustomization("spicyLevel", 3)}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-lg">👑</span>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800 text-sm mb-1">Serviço Premium</h4>
                        <p className="text-xs text-gray-600">Atendimento diferenciado, o mais solicitado</p>
                      </div>
                      {customization.spicyLevel === 3 && (
                        <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    {/* Popular badge */}
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                      POPULAR
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Utensils Section */}
            <div className="mb-6">
              <h3 className="font-bold text-gray-800 text-sm mb-3">Precisa de materiais adicionais?</h3>
              <div className="space-y-3">
                {/* Material Option */}
                <div
                  className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    customization.includeCutlery ? "border-orange-500 bg-orange-50" : "border-gray-300 bg-white"
                  }`}
                  onClick={() => updateCustomization("includeCutlery", !customization.includeCutlery)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">📋</span>
                      <div>
                        <h4 className="font-bold text-gray-800 text-sm">Incluir materiais</h4>
                        <p className="text-xs text-gray-600">Materiais complementares necessários</p>
                      </div>
                    </div>
                    {customization.includeCutlery && (
                      <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Documentation Option */}
                <div
                  className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    customization.includeNapkin ? "border-orange-500 bg-orange-50" : "border-gray-300 bg-white"
                  }`}
                  onClick={() => updateCustomization("includeNapkin", !customization.includeNapkin)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">📄</span>
                      <div>
                        <h4 className="font-bold text-gray-800 text-sm">Incluir documentação</h4>
                        <p className="text-xs text-gray-600">Documentos e comprovantes</p>
                      </div>
                    </div>
                    {customization.includeNapkin && (
                      <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-200 z-50">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-green-600">R$ {selectedProduct.price.toFixed(2)}</div>
              <Button
                onClick={() => {
                  if (!validateCustomization()) {
                    return
                  }
                  if (selectedProduct) {
                    addToCart(selectedProduct)
                    setCurrentSection("cart")
                  }
                }}
                className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-4 rounded-full font-bold text-base shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
              >
                CONTINUAR PEDIDO
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Products Section - Only show when location is confirmed */}
      {currentSection === "products" && hasAddress && (
        <div className="min-h-screen pb-24 bg-white">
          {/* Header com fundo bege/creme */}
          <div className="bg-[#F5E6D3] pt-20 pb-24 relative">
            {/* Área do Banner */}
            <div className="text-center py-6">
              <span className="text-gray-700 font-medium">local banner 1</span>
            </div>
            
            {/* Foto de Perfil - posicionada para sobrepor as seções */}
            <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-20">
              <div className="w-44 h-44 bg-[#6ABF4B] rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                <span className="text-white font-medium text-center px-4">local foto perfil:</span>
              </div>
            </div>
          </div>
          
          {/* Conteúdo principal */}
          <div className="px-6 pt-24 pb-6 max-w-lg mx-auto">
            {/* Informações do restaurante */}
            <div className="text-center mb-6">
              {/* Nome da loja com verificação */}
              <div className="flex items-center justify-center space-x-2 mb-2">
                <h2 className="text-2xl font-bold text-gray-800">Frango Goiano</h2>
                <div className="w-3.5 h-3.5 bg-blue-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-2.5 h-2.5 text-white" />
                </div>
              </div>

              {/* Pedido Mínimo */}
              <p className="text-gray-400 text-sm mb-1">Pedido Mínimo: R$ 30,00</p>
              
              {/* Entrega Grátis */}
              <div className="flex items-center justify-center space-x-1 text-sm mb-2">
                <Bike className="w-2.5 h-2.5 text-gray-400" />
                <span className="text-gray-400">Entrega</span>
                <span className="text-green-500 font-medium">Grátis</span>
              </div>

              {/* Avaliação */}
              <div className="flex items-center justify-center space-x-1 mb-3">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <span className="font-bold text-sm ml-1">4,9</span>
                <span className="text-gray-400 text-sm">(1.992 avaliações)</span>
              </div>

              {/* Status de funcionamento */}
              <div className="inline-flex items-center space-x-2 bg-green-50 border border-green-200 rounded-full px-4 py-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-green-600 font-bold text-sm">ABERTO AGORA - ATÉ 14:00</span>
              </div>
            </div>

            {/* Promotions Section */}
            <div className="mb-6">
              <div className="flex items-center space-x-1 mb-4">
                <h3 className="text-base font-bold text-gray-800">PROMOÇÕES</h3>
                <Flame className="w-4 h-4 text-yellow-400" strokeWidth={1.5} />
              </div>
              <div className="space-y-3">
                {promoProducts.map((product, index) => (
                  <Card
                    key={product.id}
                    className="rounded-2xl border-0 overflow-hidden shadow-sm bg-gray-100"
                  >
                    <CardContent className="p-4 min-h-[100px]">
                      {/* Card vazio para placeholder visual */}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="mb-8">
              {/* Reviews Summary */}
              <Card className="mb-4 rounded-2xl border-0 shadow-lg bg-gradient-to-r from-orange-500 to-red-600">
                <CardContent className="p-4 text-center">
                  <div className="text-white">
                    <h4 className="text-base font-bold mb-2">Mais de 1.800 clientes satisfeitos!</h4>
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <div className="flex space-x-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 text-yellow-300 fill-yellow-300" />
                        ))}
                      </div>
                      <span className="text-lg font-bold">4,8</span>
                    </div>
                    <p className="text-white/90 text-sm">"Qualidade que faz a diferença"</p>
                  </div>
                </CardContent>
              </Card>

              <div className="relative overflow-hidden rounded-xl">
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentReviewIndex * 100}%)` }}
                >
                  {reviews.map((review, index) => (
                    <div key={index} className="w-full flex-shrink-0">
                      <Card
                        className="rounded-xl border-0 shadow-sm mx-1"
                        style={{
                          background:
                            index % 3 === 0
                              ? "linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)"
                              : index % 3 === 1
                                ? "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)"
                                : "linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)",
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                              <Quote className="w-4 h-4 text-orange-500 mt-1" />
                            </div>
                            <div className="flex-1">
                              <p className="text-gray-700 text-sm mb-2 italic">"{review.comment}"</p>
                              <div className="flex items-center justify-between">
                                <p className="font-semibold text-orange-700 text-sm">— {review.name}</p>
                                <div className="flex space-x-0.5">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>

                <div className="flex justify-center mt-3 space-x-2">
                  {reviews.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentReviewIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentReviewIndex ? "bg-orange-500" : "bg-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Section to rate the service */}
            <div className="px-4 mb-6">
              <Card className="bg-white rounded-2xl shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-gray-800">Avalie nosso serviço</h3>
                      <p className="text-xs text-gray-600">Sua opinião é importante</p>
                    </div>
                    <Button
                      onClick={() => setCurrentSection("rating")}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full text-xs font-bold"
                    >
                      <Star className="w-3 h-3 mr-1" />
                      AVALIAR
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Cart Section */}
      {currentSection === "cart" && (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4 pt-20">
          <Card className="max-w-2xl mx-auto shadow-2xl rounded-3xl border-0">
            <CardContent className="p-4 bg-gradient-to-br from-white to-orange-50">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
                <ShoppingCart className="w-5 h-5 text-orange-600" />
                <span>Resumo do Pedido</span>
              </h2>
              {cart.length === 0 ? (
                <div className="text-center p-6">
                  <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">Seu carrinho está vazio.</p>
                  <Button
                    onClick={() => setCurrentSection("products")}
                    className="mt-4 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full font-bold text-sm"
                  >
                    Voltar aos serviços
                  </Button>
                </div>
              ) : (
                <>
                  <ul className="space-y-3">
                    {cart.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center justify-between bg-white rounded-2xl shadow-sm p-3"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-xl overflow-hidden">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-200 to-orange-300 rounded-xl flex items-center justify-center">
                              <span className="text-lg">📦</span>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-gray-800">{item.name}</h4>
                            <p className="text-xs text-gray-600">R$ {item.price.toFixed(2)}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-8 h-8 rounded-full border-gray-300"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-8 h-8 rounded-full border-gray-300"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-800">Subtotal</span>
                      <span className="text-lg font-bold text-gray-800">R$ {getTotalPrice().toFixed(2)}</span>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-800">Taxa de entrega</span>
                      <span className="text-lg font-bold text-gray-800">Grátis</span>
                    </div>

                    <div className="py-4 border-t border-gray-200">
                      <div className="bg-gray-50 rounded-xl p-3 mb-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-4 h-4 bg-gray-500 rounded-full flex items-center justify-center">
                            <Clock className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-sm font-bold text-gray-800">Entrega Estimada</span>
                        </div>
                        <p className="text-xs text-gray-700">
                          Seu pedido chegará entre {(() => {
                            const now = new Date()
                            const deliveryStart = new Date(now.getTime() + 30 * 60000)
                            const deliveryEnd = new Date(now.getTime() + 40 * 60000)
                            return `${deliveryStart.getHours().toString().padStart(2, "0")}:${deliveryStart.getMinutes().toString().padStart(2, "0")} e ${deliveryEnd.getHours().toString().padStart(2, "0")}:${deliveryEnd.getMinutes().toString().padStart(2, "0")}`
                          })()}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-gray-800">Total</span>
                        <span className="text-2xl font-bold text-green-600">R$ {getTotalPrice().toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h3 className="font-bold text-gray-800 text-sm mb-3">Alguma observação?</h3>
                      <Input
                        placeholder="Ex: observações especiais, preferências, etc..."
                        value={observations}
                        onChange={(e) => setObservations(e.target.value)}
                        className="rounded-full border-2 border-gray-300 px-4 py-3 text-sm"
                      />
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <a href={generateWhatsAppMessage()} target="_blank" rel="noopener noreferrer">
                      <Button className="w-full h-12 text-sm font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-green-500 hover:bg-green-600 text-white">
                        <div className="flex items-center justify-center space-x-3">
                          <div className="relative">
                            <ShoppingCart className="w-4 h-4" />
                            <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                              <span className="text-white text-xs font-bold">{cart.length}</span>
                            </div>
                          </div>
                          <span className="text-sm">FINALIZAR PEDIDO</span>
                          <span className="font-bold text-sm">R$ {getTotalPrice().toFixed(2)}</span>
                        </div>
                      </Button>
                    </a>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Floating Cart Button */}
      {cart.length > 0 && currentSection === "products" && hasAddress && (
        <div className="fixed bottom-6 left-4 right-4 z-50">
          <Button
            onClick={() => setCurrentSection("cart")}
            className="w-full py-3 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 rounded-2xl bg-green-500 hover:bg-green-600 text-white"
          >
            <div className="flex items-center justify-center space-x-3">
              <div className="relative">
                <ShoppingCart className="w-4 h-4" />
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-xs font-bold">{cart.length}</span>
                </div>
              </div>
              <span className="text-sm">Ver Carrinho</span>
              <span className="font-bold text-sm">R$ {getTotalPrice().toFixed(2)}</span>
            </div>
          </Button>
        </div>
      )}
    </div>
  )
}
