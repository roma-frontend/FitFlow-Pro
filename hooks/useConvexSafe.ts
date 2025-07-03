// hooks/useConvexSafe.ts
import { useQuery as useConvexQuery, useMutation as useConvexMutation } from "convex/react";
import { FunctionReference, FunctionReturnType } from "convex/server";

export function useSafeQuery<Query extends FunctionReference<"query">>(
  query: Query | undefined,
  ...args: Query extends FunctionReference<"query", infer Args> ? [Args] : []
): FunctionReturnType<Query> | undefined {
  try {
    if (!query) return undefined;
    return useConvexQuery(query, ...args);
  } catch (error) {
    console.warn('Convex query not available:', error);
    return undefined;
  }
}

export function useSafeMutation<Mutation extends FunctionReference<"mutation">>(
  mutation: Mutation | undefined
) {
  try {
    if (!mutation) return () => Promise.reject(new Error('Mutation not available'));
    return useConvexMutation(mutation);
  } catch (error) {
    console.warn('Convex mutation not available:', error);
    return () => Promise.reject(new Error('Mutation not available'));
  }
}