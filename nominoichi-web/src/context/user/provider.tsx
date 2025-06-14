import { useAccount } from 'wagmi'
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { UserInfo, UserContextType } from "./types"
import { walletClient } from "@/lib/blockchain/client"

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
    const { address } = useAccount()
    const [isLogin, setIsLogin] = useState(false)
    const [userInfo, setUserInfo] = useState<UserInfo>({
        authHash: "",
        expires: "",
        address: "",
        email: "",
        phoneNum: "",
    })

    useEffect(() => {
        const savedUserInfo = localStorage.getItem("userInfo")
        if (savedUserInfo) {
            try {
                setUserInfo(JSON.parse(savedUserInfo))
                setIsLogin(true)
            } catch (error) {
                console.error("Failed to parse user info from localStorage:", error)
                setIsLogin(false)
            }
        }
    }, [])

    const login = async() => {
        const nonce = 'ssssssss'
        const authRequest = {
            types: {
                AuthRequest: [
                    { name: 'nonce', type: 'string' }
                ]
            },
            domain: {
                name: 'Nominoichi',
                version: '1',
                chainId: 84532,
                verifyingContract: '0x0000000000000000000000000000000000000000'
            },
            message: {
                nonce
            }
        }
        
        const authHash = await walletClient.signTypedData({
            account: address as `0x${string}`,
            primaryType: 'AuthRequest',
            types: authRequest.types,
            message: authRequest.message
        })
        
        const tempInfo = userInfo
        tempInfo.authHash = authHash
        setUserInfo(tempInfo)
        setIsLogin(true)
        localStorage.setItem("userInfo", JSON.stringify(tempInfo))
    }

    const logout = () => {
        setUserInfo({
            authHash: "",
            expires: "",
            address: "",
            email: "",
            phoneNum: "",
        })
        setIsLogin(false)
        localStorage.removeItem("userInfo")
    }

    return (
        <UserContext.Provider
            value={{
                userInfo,
                login,
                logout,
                setUserInfo,
                isLogin
            }}
        >
            {children}
        </UserContext.Provider>
    )
}

export function useUser() {
    const context = useContext(UserContext)
    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider")
    }
    return context
} 