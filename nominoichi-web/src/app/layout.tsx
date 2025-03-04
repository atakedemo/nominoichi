// import type { Metadata } from "next";
import { Box } from "@chakra-ui/react"
import { Inter } from "next/font/google"
// import Navbar from "@/components/navbar"
import { Providers } from "./providers";

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
          {/* <Box minH="100vh"> */}
            <Box as="main" maxW="1200px" mx="auto" px={4}>
              {children}
            </Box>
          {/* </Box> */}
        </Providers>
      </body>
    </html>
  )
}