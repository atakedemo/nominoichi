"use client"

import { Box, Heading, SimpleGrid, Text } from "@chakra-ui/react"
import ProductCard from "@/components/product-card"
import { products } from "@/data/products"

export default function ProductListPage() {
  return (
    <Box py={8}>
      <Heading mb={6}>Our Products</Heading>
      <Text mb={8} color="gray.600">
        Browse our collection of high-quality products
      </Text>
      <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spaceX={6}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </SimpleGrid>
    </Box>
  )
}