"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Field, Box, Button, Flex, Grid, Heading, Input, Stack, Text } from "@chakra-ui/react"
import { useCart } from "@/context/cart-context"
import { toaster } from "@/components/ui/toaster"

export default function CheckoutPage() {
  const { cart, totalPrice, clearCart } = useCart()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (cart.length === 0) {
      toaster.error({
        title: "Cart is empty",
        description: "Please add items to your cart before checking out",
        duration: 2000,
      })
      router.push("/")
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      clearCart()
      setIsSubmitting(false)
      router.push("/checkout/complete")
    }, 1500)
  }

  return (
    <Box py={8}>
      <Heading mb={6}>Checkout</Heading>

      <form onSubmit={handleSubmit}>
        <Flex direction={{ base: "column", lg: "row" }} gap={8} align={{ base: "center", lg: "start" }}>
          <Box flex="1" width="full">
            <Stack spaceX={8}>
              <Box>
                <Heading size="md" mb={4}>
                  Shipping Information
                </Heading>
                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
                  <Field.Root required>
                    <Field.Label>First Name</Field.Label>
                    <Input placeholder="First Name" />
                  </Field.Root>
                  <Field.Root required>
                    <Field.Label>Last Name</Field.Label>
                    <Field.RequiredIndicator />
                    <Input placeholder="Last Name" />
                  </Field.Root>
                  <Field.Root required gridColumn={{ md: "span 2" }}>
                    <Field.Label>Email Address</Field.Label>
                    <Field.RequiredIndicator />
                    <Input type="email" placeholder="Email Address" />
                  </Field.Root>
                  {/* <Field.Root required gridColumn={{ md: "span 2" }}>
                    <Field.Label>Address</Field.Label>
                    <Input placeholder="Street Address" />
                  </Field.Root>
                  <Field.Root required>
                    <Field.Label>City</Field.Label>
                    <Input placeholder="City" />
                  </Field.Root>
                  <Field.Root required>
                    <Field.Label>Postal Code</Field.Label>
                    <Input placeholder="Postal Code" />
                  </Field.Root>
                  <Field.Root required>
                    <Field.Label>Country</Field.Label>
                    <Input placeholder="Country" />
                  </Field.Root>
                  <Field.Root required>
                    <Field.Label>Phone</Field.Label>
                    <Input type="tel" placeholder="Phone Number" />
                  </Field.Root> */}
                </Grid>
              </Box>

              <Box>
                <Heading size="md" mb={4}>
                  Payment Method
                </Heading>
              </Box>
            </Stack>
          </Box>

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
            <Stack spaceX={2} mb={4}>
              {cart.map((item) => (
                <Flex key={item.id} justify="space-between">
                  <Text>
                    {item.name} x {item.quantity}
                  </Text>
                  <Text>${(item.price * item.quantity).toFixed(2)}</Text>
                </Flex>
              ))}
            </Stack>
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
            <Button
              colorScheme="blue"
              size="lg"
              width="full"
              type="submit"
              loading={isSubmitting}
              loadingText="Processing"
            >
              Complete Order
            </Button>
          </Box>
        </Flex>
      </form>
    </Box>
  )
}