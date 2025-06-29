declare module 'convex/react' {
  import { ConvexReactClient } from 'convex/react';
  
  export function useQuery<T = any>(
    query: any,
    args?: any
  ): T | undefined;
  
  export function useMutation<T = any>(
    mutation: any
  ): (args: any) => Promise<T>;
  
  export function ConvexProvider(props: {
    client: ConvexReactClient;
    children: React.ReactNode;
  }): JSX.Element;
}

declare module 'convex/browser' {
  export class ConvexHttpClient {
    constructor(address: string);
    query(name: string, args?: any): Promise<any>;
    mutation(name: string, args?: any): Promise<any>;
  }
}
