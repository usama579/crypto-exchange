import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      firstName?: string
      lastName?: string
      isEmailVerified?: boolean
      referralCode?: string
      createdAt?: string
    }
  }

  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    firstName?: string
    lastName?: string
    isEmailVerified?: boolean
    referralCode?: string
    createdAt?: string
  }
}