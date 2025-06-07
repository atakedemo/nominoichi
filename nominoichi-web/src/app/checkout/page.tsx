"use client"

import type React from "react"
import axios from 'axios';
import { useState } from "react"
import { useRouter } from "next/navigation"
import { 
  Field, 
  Box, 
  Button, 
  Flex, 
  Grid,
  Heading, 
  Input, 
  Stack, 
  Text, 
  Dialog, 
  Portal,
  Spinner,
  Steps,
} from "@chakra-ui/react"
import { useAccount, useConnect } from 'wagmi';
import { useCart } from "@/context/cart-context"
import { toaster } from "@/components/ui/toaster"
import { PurchaseWithPaymaster } from '@/lib/call-tx'
import { publicClient } from '@/lib/client'

export default function CheckoutPage() {
  const { cart, totalPrice, clearCart } = useCart()
  const { isConnected, address } = useAccount()
  const { connect, connectors } = useConnect()
  const router = useRouter()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [txStep, setTxStep] = useState(0);
  const [postalCord, setPostalCord] = useState('')
  const [rAddress, setRAddress] = useState('')
  const [email, setEmail] = useState('')
  const [phoneNum, setPhoneNum] = useState('')
  const [name, setName] = useState('')

  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault()

    if (cart.length === 0) {
      toaster.error({
        title: "Cart is empty",
        description: "Please add items to your cart before checking out",
        duration: 2000,
      })
      router.push("/")
      return
    }

    setIsSubmitting(true)
    setTxStep(0)

    try {
      // Step1: Purchase OrderToken
      // const hash = await Purchase(address as `0x${string}`);
      // console.log(hash)
      // const receipt = await publicClient.waitForTransactionReceipt({ hash })
      // console.log(receipt)
      await PurchaseWithPaymaster(address as `0x${string}`)
      setTxStep(1)

      // Step2: Send user-inpo to business owner
      axios.post('https://llbwjcy034.execute-api.ap-northeast-1.amazonaws.com/test/order', {
        "tokenId": "0",
        "ownerAddress": "0x7b718D4Ce6ca83536660a314639559F3d3f6e9e3",
        "consumerAddress": address,
        "consumer": {
            "postralCode": postalCord,
            "rAddress": rAddress,
            "email": email,
            "phoneNum": phoneNum,
            "name": name,
        },
        "tx_hash": hash,
      })
      .then(function (response) {
        console.log(response)
        setIsSubmitting(false)
        setTxStep(2)
      })
      .catch(function (error) {
        console.log(error)
        setIsSubmitting(false)
        clearCart()
      });
      
    } catch(e){
      console.log(e)
      setIsSubmitting(false)
    }
  }

  const renderModalContent = () => {
    return (
      <Steps.Root defaultStep={1} count={2} step={txStep}>
        <Steps.List>
          <Steps.Item index={0} title="on-chain">
            <Steps.Indicator mr={2} />
            <Box>
              <Steps.Title>決済処理</Steps.Title>
              <Steps.Description>オンチェーンのUSDCで決済</Steps.Description>
            </Box>
            <Steps.Separator />
          </Steps.Item>
          <Steps.Item index={1} title="off-chain">
            <Steps.Indicator mr={2}/>
            <Box>
              <Steps.Title>発送情報送付</Steps.Title>
              <Steps.Description>発送先を店舗に通知</Steps.Description>
            </Box>
            <Steps.Separator />
          </Steps.Item>
        </Steps.List>
      </Steps.Root>
    )
  };


  return (
    <Box py={8}>
      <Heading mb={6}>Checkout</Heading>

      <form onSubmit={handleSubmit}>
        <Flex direction={{ base: "column", lg: "row" }} gap={8} align={{ base: "center", lg: "start" }}>
          <Box flex="1" width="full">
            <Stack spaceX={8}>
              <Box>
                <Heading size="md" mb={4}>
                  Shipping Information
                </Heading>
                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
                <Field.Root required>
                  <Field.Label>Postal Code / 郵便番号<Field.RequiredIndicator /></Field.Label>
                  <Input 
                    value = {postalCord}
                    onChange={(e) => setPostalCord(e.target.value)}
                    placeholder="Postal Code" 
                  />
                </Field.Root>
                <Field.Root required>
                  <Field.Label>Address / 住所<Field.RequiredIndicator /></Field.Label>
                  <Input 
                    value = {rAddress}
                    onChange={(e) => setRAddress(e.target.value)}
                    placeholder="東京都千代田区1-1-1 xxビル1F"
                  />
                </Field.Root>
                <Field.Root required gridColumn={{ md: "span 2" }}>
                  <Field.Label>Email / メールアドレス<Field.RequiredIndicator /></Field.Label>
                  <Input
                    value = {email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email" placeholder="abc@example.com"
                  />
                </Field.Root>
                <Field.Root required>
                  <Field.Label>Phone Number / 電話番号</Field.Label>
                  <Input
                    value = {phoneNum}
                    onChange={(e) => setPhoneNum(e.target.value)}
                    type="tel" placeholder="08012345678"
                  />
                </Field.Root>
                <Field.Root>
                  <Field.Label>Name / 氏名</Field.Label>
                  <Input
                    value = {name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="蚤市 太郎" />
                </Field.Root>
                </Grid>
              </Box>
            </Stack>
          </Box>

          <Dialog.Root
            placement="top"
            motionPreset="slide-in-bottom"
          >
            <Box
              width={{ base: "full", lg: "300px" }}
              p={6}
              borderWidth="1px"
              borderRadius="lg"
              alignSelf={{ base: "center", lg: "start" }}
              divideY="4px"
            >
              <Heading size="md" mb={4}>
                Order Summary
              </Heading>
              <Stack spaceX={2} mb={4}>
                {cart.map((item) => (
                  <Flex key={item.id} justify="space-between">
                    <Text>
                      {item.name} x {item.quantity}
                    </Text>
                    <Text>${(item.price * item.quantity).toFixed(2)}</Text>
                  </Flex>
                ))}
              </Stack>
              <Flex justify="space-between" mb={2}>
                <Text>Subtotal / 小計</Text>
                <Text>${totalPrice.toFixed(2)}</Text>
              </Flex>
              <Flex justify="space-between" mb={2}>
                <Text>Shipping / 配送料</Text>
                <Text>Free</Text>
              </Flex>
              <Flex justify="space-between" mb={4} fontWeight="bold">
                <Text>Total / 合計</Text>
                <Text>${totalPrice.toFixed(2)}</Text>
              </Flex>
              {!isConnected && 
                <Button
                  colorScheme="blue"
                  size="lg"
                  width="full"
                  type="button"
                  onClick={() => connect({connector: connectors[0]})}
                  mb={2} 
                >
                  Connect
                </Button>
              }
              <Button
                colorScheme="blue"
                size="lg"
                width="full"
                type="submit"
                loading={isSubmitting}
                loadingText="Processing"
                disabled={!isConnected}
                mb={2} 
              >
                Order
              </Button>
              <Dialog.Trigger asChild>
                <Button 
                  colorScheme="blue"
                  size="lg"
                  width="full"
                  type="submit"
                  loading={isSubmitting}
                  loadingText="Processing"
                  disabled={!isConnected}
                  mb={2} 
                >
                  Order (direct tx) 
                </Button>
              </Dialog.Trigger>
            </Box>
            <Portal>
              {/*処理ステータス表示のポップアップ*/}
              <Dialog.Backdrop />
              <Dialog.Positioner>
                <Dialog.Content>
                  <Dialog.Header>
                      {
                        isSubmitting ? <Dialog.Title><Spinner size="sm" mr={3}/>購入処理受付中</Dialog.Title>
                        : <Dialog.Title>購入完了</Dialog.Title>
                      }
                  </Dialog.Header>
                  <Dialog.Body>
                    {renderModalContent()}
                  </Dialog.Body>
                  <Dialog.Footer>
                    <Dialog.ActionTrigger asChild>
                      <Button variant="outline">Close</Button>
                    </Dialog.ActionTrigger>
                    {!isSubmitting && <Button onClick={() => router.push("/")}>買い物を続ける</Button>}
                  </Dialog.Footer>
                </Dialog.Content>
              </Dialog.Positioner>
            </Portal>
          </Dialog.Root>
        </Flex>
      </form>
    </Box>
  )
}