'use client'

import { Inter } from "next/font/google";
import "./globals.css";
import { Provider } from 'react-redux';
import store from '@/store';
import { usePathname } from 'next/navigation';
import GlobalFormWarning from '@/components/GlobalFormWarning';

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ params: { locale }, children }) {
  const pathname = usePathname();

  return (
    <Provider store={store}>
      <html lang={locale}>
        <body className={`${inter.className} text-zinc-800 bg-[#f6f7f9] ${pathname !== '/ru' && pathname !== '/en' && !pathname.includes('admin') && 'overflow-y-scroll'}`}>
          {/* <div className='fixed top-0 left-0 w-full z-50'>
            <BarLoader color="#60a5fa" width='100%' speedMultiplier={0.3} height={4} loading={true} />
          </div> */}
          <GlobalFormWarning />
          {children}
        </body>
      </html>
    </Provider>
  );
}
