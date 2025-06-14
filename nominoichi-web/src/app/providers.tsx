'use client';

import { ReactNode } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { wagmiConfig } from './config';
import { CartProvider } from "@/context/cart/provider"
import { UserProvider } from "@/context/user/provider"
import { Toaster } from "@/components/ui/toaster"

const queryClient = new QueryClient()

export function Providers(props: { 
  children: ReactNode,
}) {
  return (
    
    <CartProvider>
      <WagmiProvider config={wagmiConfig}>
          <QueryClientProvider client={queryClient}>
            <ChakraProvider value={defaultSystem}>
              <UserProvider>
                {props.children}
                <Toaster />
              </UserProvider>
            </ChakraProvider>
          </QueryClientProvider>
      </WagmiProvider>
    </CartProvider>
    
  );
}