// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { ConvexHttpClient } from "convex/browser";
import bcrypt from "bcryptjs";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const handler = NextAuth({
  debug: true, 
  providers: [
    // Google OAuth Provider
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
    
    // Существующий Credentials Provider для обычного входа
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
          // Проверяем, существует ли пользователь
          let existingUser = await convex.query("users:getByEmail", { 
            email: user.email! 
          });

          if (!existingUser) {
            // Создаем нового пользователя
            const userId = await convex.mutation("users:create", {
              email: user.email!.toLowerCase(),
              name: user.name || "Google User",
              googleId: account.providerAccountId,
              avatar: user.image || "",
              role: "member", // По умолчанию member
              isActive: true,
              isVerified: true, // Google аккаунты считаем верифицированными
              createdAt: Date.now(),
              updatedAt: Date.now(),
              // Для Google пользователей не устанавливаем пароль
              password: await bcrypt.hash(Math.random().toString(36), 10) // Случайный пароль для безопасности
            });

            console.log("✅ Создан новый пользователь через Google:", userId);
          } else {
            // Обновляем существующего пользователя
            if (!existingUser.googleId) {
              await convex.mutation("users:update", {
                userId: existingUser._id,
                updates: {
                  googleId: account.providerAccountId,
                  avatar: existingUser.avatar || user.image || "",
                  isVerified: true,
                  updatedAt: Date.now()
                }
              });
            }

            // Обновляем время последнего входа
            await convex.mutation("users:updateLastLogin", {
              userId: existingUser._id,
              timestamp: Date.now()
            });
          }

          return true;
        } catch (error) {
          console.error("Google sign in error:", error);
          return false;
        }
      }

      return true;
    },

    async jwt({ token, user, account }) {
      // При первом входе добавляем данные пользователя в токен
      if (user) {
        token.userId = user.id;
        token.email = user.email || "";
        token.role = (user as any).role || "member";
        token.name = user.name || user.email || "User";
      }

      // Если это Google вход, получаем роль из БД
      if (account?.provider === "google" && token.email) {
        try {
          const dbUser = await convex.query("users:getByEmail", { 
            email: token.email as string 
          });
          if (dbUser) {
            token.role = dbUser.role;
            token.userId = dbUser._id;
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
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
      // Обработка редиректов после входа
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      
      // Определяем дашборд по роли
      const callbackUrl = new URL(url).searchParams.get("callbackUrl");
      if (callbackUrl?.startsWith("/")) return `${baseUrl}${callbackUrl}`;
      
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
});

export { handler as GET, handler as POST };