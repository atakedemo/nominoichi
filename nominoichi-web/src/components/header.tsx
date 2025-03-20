"use client"

import { Box, Flex, Text, Link, Button, Icon, Dialog, Portal, Heading, Badge } from "@chakra-ui/react";
import NextLink from "next/link";
import { useUserInfo } from "@/context/user-context"
import { useCart } from "@/context/cart-context"
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { UserRound, ShoppingCart } from "lucide-react"

export default function Header () {
    const {login, logout, isLogin } = useUserInfo()
    const { isConnected, address } = useAccount()
    const { connect, connectors } = useConnect()
    const { disconnect } = useDisconnect()
    const { cartCount } = useCart()

    const signOut = async() => {
        logout()
        disconnect()
    }

    const accountMenu = () => {
        if(!isLogin) {
            return (
                <Dialog.Root>
                    <Dialog.Trigger asChild>
                        <Button 
                            variant="outline" 
                            color="white" 
                            borderColor="white" 
                            size="sm" 
                            ml={4}
                        >
                            Sign In
                        </Button>
                    </Dialog.Trigger>
                    <Portal>
                        <Dialog.Backdrop />
                        <Dialog.Positioner>
                            <Dialog.Content>
                                <Dialog.Header>
                                <Dialog.Title>決済の有効化</Dialog.Title>
                                </Dialog.Header>
                                <Dialog.Body>
                                    <Box mb={4}>
                                        <Heading size="md" mb={2}>Step1: ウォレット有効化</Heading>
                                        <Button size="sm" ml={4}　disabled={isConnected}　onClick={() => connect({connector: connectors[0]})}>
                                            Connect Wallet
                                        </Button>
                                    </Box>
                                    <Heading size="md" mb={2}>Step2: サインイン</Heading>
                                    <Button　size="sm" ml={4}　disabled={!isConnected || isLogin }　onClick={()=> login()}>
                                        Sign In
                                    </Button>
                                </Dialog.Body>
                                <Dialog.Footer>
                                    <Dialog.ActionTrigger asChild>
                                        <Button variant="outline">Cancel</Button>
                                    </Dialog.ActionTrigger>
                                </Dialog.Footer>
                            </Dialog.Content>
                        </Dialog.Positioner>
                    </Portal>
                </Dialog.Root>
            )
        } else {
            return (
                <>
                    <Dialog.Root>
                        <Button variant="outline" color="white" borderColor="white" size="sm"onClick={()=> signOut()} mr={2}>
                            Sign Out
                        </Button>
                        <Dialog.Trigger asChild>
                            <Button variant="outline" color="white" borderColor="white" size="sm">   
                                <Icon as={UserRound} />
                                {address?.substring(0, 8) + "…"}
                            </Button>
                        </Dialog.Trigger>
                        <Portal>
                            <Dialog.Backdrop />
                            <Dialog.Positioner>
                                <Dialog.Content>
                                    <Dialog.Header>
                                    <Dialog.Title>アカウント情報</Dialog.Title>
                                    </Dialog.Header>
                                    <Dialog.Body>
                                        <Heading size="md">ウォレット</Heading>
                                        <Text>アドレス：{address}</Text>
                                        <Text>USDC残高：　</Text>
                                    </Dialog.Body>
                                    <Dialog.Footer>
                                        <Dialog.ActionTrigger asChild>
                                            <Button variant="outline">Cancel</Button>
                                        </Dialog.ActionTrigger>
                                    </Dialog.Footer>
                                </Dialog.Content>
                            </Dialog.Positioner>
                        </Portal>
                    </Dialog.Root>
                </>
            )
        }
    }

    return (
        <>
            <Box bg="teal.500" px={4}>
                <Flex h={16} alignItems="center" justifyContent="space-between">
                    {/* サイトタイトル部分 */}
                    <Link as={NextLink} href="/" _hover={{ textDecoration: "none" }}>
                        <Text fontSize="lg" fontWeight="bold" color="white">
                            Nominoichi / 蚤の市
                        </Text>
                    </Link>

                    {/* ナビゲーションリンク */}
                    <Flex alignItems="center">
                        <Link as={NextLink} href="/cart" color="white">
                            <Icon as={ShoppingCart} /><Badge mr={2}>{cartCount}</Badge>
                        </Link>
                        {accountMenu()}
                    </Flex>
                </Flex>
            </Box>
        </>
    );
};