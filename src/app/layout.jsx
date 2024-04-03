'use client'

import { Inter } from "next/font/google";
import "./globals.css";
import { Provider } from 'react-redux';
import store from '@/store';


const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {

  return (
    <Provider store={store}>
      <html lang="en">
        <body className={`${inter.className} text-zinc-800 bg-[#f6f7f9]`}>
          {children}
        </body>
      </html>
    </Provider>
  );
}
