// src/provider/QueryProvider.jsx

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';


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


export const QueryProvider = ( {children} ) => {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
            < ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
};