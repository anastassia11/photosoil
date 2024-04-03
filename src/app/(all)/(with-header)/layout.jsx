import Header from '@/components/header/Header'
import React from 'react'

export default function HeaderLayout({ children }) {

    return (
        <div className='min-h-screen relative pt-16'>
            <Header />
            {children}
        </div>
    )
}
