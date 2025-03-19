"use client"

import { Box, Flex, Text, Link, Button } from "@chakra-ui/react";
import NextLink from "next/link";
import { useUserInfo } from "@/context/user-context"

export default function Header (){
    const {login } = useUserInfo()

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
                        <Link as={NextLink} href="/about" color="white" px={2}>
                            About
                        </Link>
                        <Link as={NextLink} href="/contact" color="white" px={2}>
                            Contact
                        </Link>
                        <Button 
                            variant="outline" 
                            color="white" 
                            borderColor="white" 
                            size="sm" 
                            ml={4}
                            onClick={()=> login()}
                        >
                            Sign In
                        </Button>
                    </Flex>
                </Flex>
            </Box>
        </>
    );
};