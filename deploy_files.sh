#!/bin/bash
set -e

echo "=========================================="
echo "NeuralGrid 소스 파일 생성 중..."
echo "=========================================="

cd ~/n8n-neuralgrid/apps/web

# NextAuth route
echo "[1/11] NextAuth 설정..."
cat > app/api/auth/\[...nextauth\]/route.ts << 'EOF'
import NextAuth, { NextAuthOptions, DefaultSession } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string
      role: "USER" | "ADMIN"
    } & DefaultSession["user"]
  }
  
  interface User {
    role: "USER" | "ADMIN"
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: "USER" | "ADMIN"
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "your@email.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("이메일과 비밀번호를 입력해주세요")
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.password) {
          throw new Error("등록되지 않은 이메일입니다")
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          throw new Error("비밀번호가 일치하지 않습니다")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role
        session.user.id = token.id as string
      }
      return session
    }
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signin",
    error: "/auth/signin",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
EOF

echo "✓ NextAuth 설정 완료"
echo ""
echo "=========================================="
echo "✓ 파일 생성 1/11 완료"
echo "다음 명령어를 실행하세요:"
echo "  bash ~/n8n-neuralgrid/deploy_files2.sh"
echo "=========================================="
