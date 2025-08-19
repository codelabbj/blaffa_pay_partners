import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { LanguageProvider } from "@/components/providers/language-provider"
// import { WebSocketProviderWrapper } from "@/components/providers/websocket-provider-wrapper"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Connect Pro - partners Dashboard",
  description: "Professional partners site for Connect Pro",
    // 
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <LanguageProvider>
            {/* <WebSocketProviderWrapper> */}
              {children}
            {/* </WebSocketProviderWrapper> */}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
