export interface UserInfo {
    authHash: string
    expires: string
    address: string
    email: string
    phoneNum: string
}

export interface UserContextType {
    userInfo: UserInfo
    login: () => void
    logout: () => void
    setUserInfo: (info: UserInfo) => void
    isLogin: boolean
}

export interface eip712AuthRequest {
    types: {
        AuthRequest: {
            name: string
            type: string
        }[]
    }
    domain: {
        name: string
        version: string
        chainId: number
        verifyingContract: string
    }
    message: {
        nonce: string
    }
} 