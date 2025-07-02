import { SignJWT } from 'jose';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { ConvexHttpClient } from "convex/browser";
import bcrypt from "bcryptjs";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export const authOptions: NextAuthOptions = {
  debug: true,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),

    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await convex.query("users:getByEmail", {
            email: credentials.email
          });

          if (!user || !user.isActive) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.avatar || user.photoUrl
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      }
    })
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      // При входе через Google
      if (account?.provider === "google") {
        try {
          console.log("🔍 Google Sign In - проверяем пользователя:", user.email);
          
          // Используем createOrUpdateGoogleUser для правильной обработки
          const userId = await convex.mutation("users:createOrUpdateGoogleUser", {
            email: user.email!.toLowerCase(),
            name: user.name || "Google User",
            googleId: account.providerAccountId,
            photoUrl: user.image || undefined,
            role: undefined // Будет использоваться role по умолчанию или существующая
          });

          console.log("✅ Google пользователь обработан:", userId);

          // Проверяем роль для staff-login
          if (typeof window !== 'undefined' && 
              window.location.pathname.includes('staff-login')) {
            const dbUser = await convex.query("users:getByEmail", {
              email: user.email!
            });
            
            const staffRoles = ['admin', 'super-admin', 'manager', 'trainer'];
            if (dbUser && !staffRoles.includes(dbUser.role)) {
              console.log("❌ Не staff пользователь пытается войти через staff-login");
              return '/auth/error?error=AccessDenied';
            }
          }

          return true;
        } catch (error) {
          console.error("❌ Google sign in error:", error);
          return false;
        }
      }

      return true;
    },

    async jwt({ token, user, account, trigger }) {
      // При первом входе добавляем данные пользователя в токен
      if (user) {
        token.userId = user.id;
        token.email = user.email || "";
        token.role = (user as any).role || "member";
        token.name = user.name || user.email || "User";
      }

      // Если это Google вход или обновление, получаем актуальные данные из БД
      if ((account?.provider === "google" || trigger === "update") && token.email) {
        try {
          const dbUser = await convex.query("users:getByEmail", {
            email: token.email as string
          });
          if (dbUser) {
            token.role = dbUser.role;
            token.userId = dbUser._id;
            token.name = dbUser.name || token.name;
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }

      return token;
    },

    async session({ session, token }) {
      // Добавляем данные из токена в сессию
      return {
        ...session,
        user: {
          ...session.user,
          id: token.userId as string,
          role: token.role as string,
          email: token.email as string,
          name: token.name as string || session.user?.name || "User",
        }
      };
    },

    async redirect({ url, baseUrl }) {
      console.log("🔄 NextAuth redirect callback:", { url, baseUrl });
      
      // Если URL начинается с /, это внутренний путь
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      
      // Если URL с того же origin
      else if (new URL(url).origin === baseUrl) {
        return url;
      }

      // Извлекаем callbackUrl из параметров
      const urlObj = new URL(url);
      const callbackUrl = urlObj.searchParams.get("callbackUrl");
      
      if (callbackUrl?.startsWith("/")) {
        return `${baseUrl}${callbackUrl}`;
      }

      // По умолчанию возвращаем на главную
      return baseUrl;
    }
  },

  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },

  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 дней
  },

  jwt: {
    secret: process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET,
  },

  secret: process.env.NEXTAUTH_SECRET,
};

export interface UserJwtPayload {
  jti: string;
  iat: number;
  exp: number;
  userId: string;
  name: string;
  email?: string;
  role: string;
}

export function setAuthCookie(token: string): void {
  console.warn('setAuthCookie вызвана, но cookies должны устанавливаться через NextResponse');
}

export function setRoleCookie(role: string): void {
  console.warn('setRoleCookie вызвана, но cookies должны устанавливаться через NextResponse');
}

export function createToken(payload: any): string {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET не установлен');
  }
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
}

export async function verifyToken(token: string): Promise<any> {
  try {
    console.log('🔧 Проверяем JWT токен...');
    console.log('🔑 JWT_SECRET установлен:', !!process.env.JWT_SECRET);

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET не установлен');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ JWT токен декодирован:', decoded);
    return decoded;
  } catch (error) {
    console.error('❌ Ошибка проверки JWT:', error);
    throw new Error(`Invalid token: ${error}`);
  }
}

export async function signToken(payload: any) {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET не установлен');
    }
    console.log('signToken: создаем токен для:', payload);

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(secret);

    console.log('signToken: токен создан успешно');
    return token;
  } catch (error) {
    console.error('signToken: ошибка создания токена:', error);
    throw error;
  }
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    console.log("Токен из cookies:", token ? "найден" : "не найден");

    if (!token) {
      return null;
    }

    const payload = await verifyToken(token);
    console.log("Payload из токена:", payload);

    return {
      id: payload.userId,
      name: payload.name,
      email: payload.email,
      role: payload.role,
    };
  } catch (error) {
    console.error("Ошибка в getCurrentUser:", error);
    return null;
  }
}

export async function clearAuthCookies(): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('auth_token');
    cookieStore.delete('user_role');
  } catch (error) {
    console.error("Ошибка при очистке cookies:", error);
  }
}
