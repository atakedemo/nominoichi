export interface CartItem {
    id: string
    name: string
    price: number
    quantity: number
    image?: string
    description?: string
}

export interface CartContextType {
    cart: CartItem[]
    addToCart: (item: CartItem) => void
    removeFromCart: (id: string) => void
    updateQuantity: (id: string, quantity: number) => void
    clearCart: () => void
    totalPrice: number
} 