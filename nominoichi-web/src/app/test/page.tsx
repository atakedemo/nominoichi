"use client"

import { useAccount, useDisconnect, useEnsAvatar, useEnsName } from 'wagmi';
import { Image, Button, Text } from "@chakra-ui/react"
import { WalletOptions } from '@/components/wallet-options';
import { Purchase, ListProduct, PurchaseWithPaymaster, PurchaseMeta, getSmartAccountBalance } from '@/lib/call-tx'

export default function Test() {
    const { isConnected, address } = useAccount();
    const { disconnect } = useDisconnect()
    const { data: ensName } = useEnsName({ address })
    const { data: ensAvatar } = useEnsAvatar({ name: ensName! });
    
    const callPurchaseTx = async () => {
        await Purchase(address as `0x${string}`)
    }

    const callListTx = async () => {
      await ListProduct(address as `0x${string}`)
    }

    const callPurchaseWithPaymaster = async () => {
      await PurchaseWithPaymaster(address as `0x${string}`)
    }

    const callPurchaseMetaTx = async () => {
      PurchaseMeta(address as `0x${string}`)
    }

    return (
      <div>
        <>
          {!isConnected ?
            <>
              <h1>Please Connect Wallet</h1>
              <WalletOptions/>
            </> 
            :
            <>
              <Button onClick={() => disconnect()}>Disconnect</Button>
              <Button onClick={() => callPurchaseTx()}>Call</Button>
              <Button onClick={() => callListTx()}>Call</Button>
              <div>
                  {ensAvatar && <Image src={ensAvatar} />}
                  {address && <div>{ensName ? `${ensName} (${address})` : address}</div>}
              </div>
              <Button onClick={() => callPurchaseWithPaymaster()}>Purchase with paymaster</Button>
              <Button onClick={() => getSmartAccountBalance()}>Balance Check</Button>
              <div>
                <Text>With Meta-Tx</Text>
                <Button onClick={() => callPurchaseMetaTx()}>Purchase with meta-tx</Button>
              </div>
            </> 
          }
        </>
      </div>
    );
  }