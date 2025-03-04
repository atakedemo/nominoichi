"use client"

import { Box,Flex,Image,Text,IconButton } from "@chakra-ui/react"
import { Trash } from "lucide-react"
import { NumberInputField, NumberInputRoot } from "@/components/ui/number-input"
import type { CartItem as CartItemType } from "@/types/product"
import { useCart } from "@/context/cart-context"

interface CartItemProps {
  item: CartItemType
}

export default function CartItem({ item }: CartItemProps) {
  const { updateCartItemQuantity, removeFromCart } = useCart()

  return (
    <Flex borderWidth="1px" borderRadius="lg" p={4} gap={4} align="center" width="full">
      <Image
        src={item.image || "/placeholder.svg"}
        alt={item.name}
        boxSize="80px"
        objectFit="cover"
        borderRadius="md"
      />

      <Box flex="1">
        <Text fontWeight="semibold" fontSize="lg">
          {item.name}
        </Text>
        <Text color="gray.600">${item.price.toFixed(2)}</Text>
      </Box>

      <Flex align="center" gap={4}>
        <NumberInputRoot
            size="sm"
            maxW={20}
            min={1}
            max={10}
            value={item.quantity.toString()}
            onValueChange={({ value }) => {
            updateCartItemQuantity(item.id, Number(value))
        }}
        >
          <NumberInputField />
        </NumberInputRoot>

        <Text fontWeight="semibold" minW="80px" textAlign="right">
          ${(item.price * item.quantity).toFixed(2)}
        </Text>

        <IconButton
          aria-label="Remove item"
          variant="ghost"
          colorScheme="red"
          onClick={() => removeFromCart(item.id)}
        >
            <Trash size={16} />
        </IconButton>
      </Flex>
    </Flex>
  )
}
