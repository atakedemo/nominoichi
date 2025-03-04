"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { Box, Image, Text, Stack, Heading, Button } from "@chakra-ui/react"
import { toaster } from "@/components/ui/toaster"
import { ShoppingCart } from "lucide-react"
import type { Product } from "@/types/product"
import { useCart } from "@/context/cart-context"

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter()
  const { addToCart } = useCart()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    addToCart({ ...product, quantity: 1 })
    toaster.success({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`,
      duration: 2000,
    })
  }

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      transition="transform 0.3s, box-shadow 0.3s"
      _hover={{
        transform: "translateY(-5px)",
        boxShadow: "xl",
        cursor: "pointer",
      }}
      onClick={() => router.push(`/product/${product.id}`)}
    >
      <Image
        src={product.image || "/placeholder.svg"}
        alt={product.name}
        height="200px"
        width="100%"
        objectFit="cover"
      />
      <Box p={4}>
        <Stack spaceX={2}>
          <Heading size="md">
            {product.name}
          </Heading>
          <Text color="blue.500" fontSize="xl" fontWeight="bold">
            ${product.price.toFixed(2)}
          </Text>
          <Text color="gray.600" fontSize="sm">
            {product.description}
          </Text>
          <Button
            colorScheme="blue"
            variant="outline"
            onClick={handleAddToCart}
            mt={2}
          >
            <ShoppingCart size={16} /> Add to Cart
          </Button>
        </Stack>
      </Box>
    </Box>
  )
}