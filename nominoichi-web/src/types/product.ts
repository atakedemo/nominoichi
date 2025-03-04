export interface Product {
    id: string
    name: string
    price: number
    description: string
    image: string
}

export interface CartItem extends Product {
    quantity: number
}  