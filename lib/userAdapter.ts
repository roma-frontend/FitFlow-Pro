import { User } from "@/types/user";

// lib/userAdapter.ts
export function adaptAuthUserToAppUser(authUser: any): User {
  return {
    ...authUser,
    createdAt: authUser.createdAt instanceof Date ? authUser.createdAt.getTime() : authUser.createdAt,
    lastLogin: authUser.lastLogin instanceof Date ? authUser.lastLogin.getTime() : authUser.lastLogin
  };
}