export interface Auth {
  name: string
  email?: string
  picture?: string
  preferred_username?: string
  sub?: string
}

export interface Provider {
  id: string
  name: string
  max_tokens: number
}

