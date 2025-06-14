export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://llbwjcy034.execute-api.ap-northeast-1.amazonaws.com/test'

export const API_ENDPOINTS = {
    PURCHASE: `${API_BASE_URL}/calltx/x402/purchase`,
    USEROP_GAS_PRICE: `${API_BASE_URL}/calltx/account-abstraction/userop-gasprice`,
    ORDER: `${API_BASE_URL}/order/post`
} as const 