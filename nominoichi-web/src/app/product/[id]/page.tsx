"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Box, Button, Flex, Heading, Image, Stack, Text } from "@chakra-ui/react"
import { NumberInputField, NumberInputRoot } from "@/components/ui/number-input"
import { products } from "@/data/products"
import { useCart } from "@/context/cart-context"
import { toaster } from "@/components/ui/toaster"

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { addToCart } = useCart()
  const [quantity, setQuantity] = useState(1)

  const product = products.find((p) => p.id === params.id)

  if (!product) {
    return (
      <Box py={8} textAlign="center">
        <Heading>Product Not Found</Heading>
        <Button mt={4} onClick={() => router.push("/")}>
          Back to Products
        </Button>
      </Box>
    )
  }

  const handleAddToCart = () => {
    addToCart({ ...product, quantity })
    toaster.success({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`,
      duration: 2000,
    })
  }

  return (
    <Box py={8}>
      <Flex direction={{ base: "column", md: "row" }} gap={8} align={{ base: "center", md: "start" }}>
        <Box width={{ base: "full", md: "50%" }} maxW={{ base: "400px", md: "none" }}>
          <Image src={product.image || "/placeholder.svg"} alt={product.name} borderRadius="md" objectFit="cover" />
        </Box>
        <Stack spaceX={4} width={{ base: "full", md: "50%" }}>
          <Heading>{product.name}</Heading>
          <Text fontSize="2xl" fontWeight="bold" color="blue.500">
            ${product.price.toFixed(2)}
          </Text>
          <Text color="gray.600">{product.description}</Text>

          <Box py={4}>
            <Text mb={2}>Quantity:</Text>
            <Flex maxW="200px">
              <NumberInputRoot
                defaultValue="1"
                min={1}
                max={10}
                value={quantity.toString()}
                onValueChange={({ value }) => {
                    setQuantity(Number(value))
                }}
              >
                <NumberInputField />
              </NumberInputRoot>
            </Flex>
          </Box>

          <Button colorScheme="blue" size="lg" onClick={handleAddToCart} maxW="200px">
            Add to Cart
          </Button>
        </Stack>
      </Flex>
    </Box>
  )
}