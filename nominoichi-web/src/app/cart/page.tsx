"use client"

import { useRouter } from "next/navigation"
import { Box, Button, Flex, Heading, Stack, Text } from "@chakra-ui/react"
import CartItem from "@/components/cart-item"
import { useCart } from "@/context/cart-context"
import { toaster } from "@/components/ui/toaster"

export default function CartPage() {
  const { cart, clearCart, totalPrice } = useCart()
  const router = useRouter()

  const handleCheckout = () => {
    if (cart.length === 0) {
      toaster.error({
        title: "Cart is empty",
        description: "Please add items to your cart before checking out",
        duration: 2000,
      })
      return
    }
    router.push("/checkout")
  }

  return (
    <Box py={8}>
      <Heading mb={6}>Your Cart</Heading>

      {cart.length === 0 ? (
        <Box textAlign="center" py={10}>
          <Text fontSize="xl" mb={4}>
            Your cart is empty
          </Text>
          <Button colorScheme="blue" onClick={() => router.push("/")}>
            Continue Shopping
          </Button>
        </Box>
      ) : (
        <Flex direction={{ base: "column", lg: "row" }} gap={8} align={{ base: "center", lg: "start" }}>
          <Stack spaceX={4} flex="1" width="full">
            {cart.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}
          </Stack>

          <Box
            width={{ base: "full", lg: "300px" }}
            p={6}
            borderWidth="1px"
            borderRadius="lg"
            alignSelf={{ base: "center", lg: "start" }}
            divideY="4px"
          >
            <Heading size="md" mb={4}>
              Order Summary
            </Heading>
            <Flex justify="space-between" mb={2}>
              <Text>Subtotal</Text>
              <Text>${totalPrice.toFixed(2)}</Text>
            </Flex>
            <Flex justify="space-between" mb={2}>
              <Text>Shipping</Text>
              <Text>Free</Text>
            </Flex>
            <Flex justify="space-between" mb={4} fontWeight="bold">
              <Text>Total</Text>
              <Text>${totalPrice.toFixed(2)}</Text>
            </Flex>
            <Stack spaceX={3}>
              <Button colorScheme="blue" size="lg" onClick={handleCheckout}>
                Proceed to Checkout
              </Button>
              <Button variant="outline" onClick={() => router.push("/")}>
                Continue Shopping
              </Button>
              <Button variant="ghost" colorScheme="red" onClick={clearCart}>
                Clear Cart
              </Button>
            </Stack>
          </Box>
        </Flex>
      )}
    </Box>
  )
}