"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Box, Button, Heading, Text, VStack, Icon } from "@chakra-ui/react"
import { CheckCircle } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { toaster } from "@/components/ui/toaster"

export default function PurchaseCompletePage() {
  const router = useRouter()
  const { cart } = useCart()

  useEffect(() => {
    // If someone navigates directly to this page without checkout
    if (cart.length > 0) {
      toaster.create({
        title: "Warning",
        description: "Please complete checkout before accessing this page",
        duration: 3000,
      })
      router.push("/checkout")
    }
  }, [cart, router])

  return (
    <Box py={12} textAlign="center">
      <VStack spaceX={6}>
        <Icon as={CheckCircle} boxSize={20} color="green.500" />
        <Heading>Thank You for Your Purchase!</Heading>
        <Text fontSize="lg" maxW="600px" mx="auto">
          Your order has been successfully placed. We have sent a confirmation email with all the details of your
          purchase.
        </Text>
        <Text fontSize="md" color="gray.600">
          Order #:{" "}
          {Math.floor(Math.random() * 1000000)
            .toString()
            .padStart(6, "0")}
        </Text>
        <Box pt={6}>
          <Button colorScheme="blue" size="lg" onClick={() => router.push("/")}>
            Continue Shopping
          </Button>
        </Box>
      </VStack>
    </Box>
  )
}