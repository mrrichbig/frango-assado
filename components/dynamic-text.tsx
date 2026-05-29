"use client"

import { useCidade } from "@/contexts/location-context"

interface DynamicTextProps {
  children: string
  className?: string
}

// Componente para substituir {{cidade}} automaticamente
export function DynamicText({ children, className = "" }: DynamicTextProps) {
  const cidade = useCidade()

  // Ensure children is a string and handle the replacement safely
  const text = typeof children === "string" ? children : String(children || "")
  const processedText = text.replace(/\{\{cidade\}\}/g, cidade)

  return <span className={className}>{processedText}</span>
}

// Hook para usar em qualquer lugar
export function useDynamicText(text: string): string {
  const cidade = useCidade()
  const safeText = typeof text === "string" ? text : String(text || "")
  return safeText.replace(/\{\{cidade\}\}/g, cidade)
}
