'use client'

import { Inter } from 'next/font/google'
import { Provider } from 'react-redux'

import GlobalFormWarning from '@/components/GlobalFormWarning'

import './globals.css'
import store from '@/store'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const inter = Inter({ subsets: ['latin'] })

const queryClient = new QueryClient({})

export default function RootLayout({ params: { locale }, children }) {
	return (
		<Provider store={store}>
			<html lang={locale}>
				<body
					className={`${inter.className} text-zinc-800 bg-[#f6f7f9]`}
					suppressHydrationWarning={true}
				>
					<QueryClientProvider client={queryClient}>
						{/* <div className='fixed top-0 left-0 w-full z-50'>
            <BarLoader color="#60a5fa" width='100%' speedMultiplier={0.3} height={4} loading={true} />
          </div> */}
						<GlobalFormWarning />
						{children}
						<ReactQueryDevtools initialIsOpen={false} />
					</QueryClientProvider>
				</body>
			</html>
		</Provider>
	)
}
