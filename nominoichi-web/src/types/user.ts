export interface UserInfo {
    authHash: string,
    expires: string,
    address: string,
    email: string,
    phoneNum: string,
}

export const eip712AuthRequest = (nonce: string) => {
    const domain = {
        nonce,
        expires: BigInt(Math.floor(Date.now() / 1000) + 30 * 60),
    }
    const types = {
        AuthRequest: [
            { name: 'nonce', type: 'string' },
            { name: 'expires', type: 'uint256' },
        ],
    }
    const message = {
        nonce,
        expires: BigInt(Math.floor(Date.now() / 1000) + 30 * 60),
    }
    return {
        domain,
        types,
        message,
    }
  }