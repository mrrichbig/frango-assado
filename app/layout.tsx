import type React from "react"
import type { Metadata } from "next"
import { Nunito } from "next/font/google"
import "./globals.css"
import { LocationProvider } from "@/contexts/location-context"

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700", "800"],
  variable: "--font-nunito",
})

export const metadata: Metadata = {
  title: "Delivery Express - Serviços de Entrega",
  description: "Plataforma de delivery premium para diversas cidades brasileiras",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={`${nunito.variable} antialiased`}>
        <LocationProvider>{children}</LocationProvider>
      </body>
    </html>
  )
}
