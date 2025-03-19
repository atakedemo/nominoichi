// import type { Metadata } from "next";
import { Box } from "@chakra-ui/react"
import { Inter } from "next/font/google"
// import Navbar from "@/components/navbar"
import { Providers } from "./providers";
import Header from "@/components/header"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      
        <body className={inter.className}>
          <Providers>
            <Header />
            <Box>
              {children}
            </Box>
          </Providers>
        </body>
    </html>
  )
}