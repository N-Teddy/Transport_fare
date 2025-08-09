// src/provider/QueryProvider.ts

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { type ReactNode } from 'react';


// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false, // disable automatic refetch on window focus
            staleTime: 5 * 60 * 1000, // 5 minutes before data becomes stale
            retry: 1, // Will retry failed queries 1 time before displaying an error
        },
    },
});


export const QueryProvider = ({ children }: { children: ReactNode }) => {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
            < ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
};