"use client"

import { useAccount } from 'wagmi';
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { UserInfo, eip712AuthRequest } from "@/types/user"
import { walletClient } from "@/lib/client"

interface UserContextType {
    userInfo: UserInfo
    login: () => void
    logout: () => void
    setUserInfo: (info: UserInfo) => void
    isLogin: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
    const { address } = useAccount();
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
                console.error("Failed to parse cart from localStorage:", error)
                setIsLogin(false)
            }
        }
    }, [])

    const login = async() => {
        const nonce = 'ssssssss'
        const authRequest = eip712AuthRequest(nonce)
        const authHash = await walletClient.signTypedData({
            account: address as `0x${string}`,
            primaryType: 'AuthRequest',
            types: authRequest.types,
            message: authRequest.message
        })
        const tempInfo = userInfo;
        tempInfo.authHash = authHash;
        setUserInfo(tempInfo);
        setIsLogin(true)
        console.log(tempInfo)
        console.log(isLogin)
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
        localStorage.removeItem("userInfo");
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

export function useUserInfo() {
    const context = useContext(UserContext)
    if (context === undefined) {
      throw new Error("useUserInfo must be used within a UserInfoProvider")
    }
    return context
}