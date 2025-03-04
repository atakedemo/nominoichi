'use client';

import { ReactNode } from 'react';
// import { WagmiProvider } from 'wagmi';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
// import { wagmiConfig } from './config/wagmiConfig';
import { CartProvider } from "@/context/cart-context"
import { Toaster } from "@/components/ui/toaster"

// const queryClient = new QueryClient()

export function Providers(props: { 
  children: ReactNode,
}) {
  return (
    <ChakraProvider value={defaultSystem}>
        <CartProvider>
            {/* <WagmiProvider config={wagmiConfig}>
                <QueryClientProvider client={queryClient}> */}
                    {props.children}
                    <Toaster />
                {/* </QueryClientProvider>
            </WagmiProvider> */}
        </CartProvider>
    </ChakraProvider>
  );
}