
import Breadcrumbs from '@/components/Breadcrumbs'
import React from 'react'

export default function MaxWidthLayout({ children }) {
    return (
        <div className='max-w-screen-2xl w-full m-auto px-8 pt-8'>
            <Breadcrumbs homeElement={'Главная'} />
            {children}
        </div>
    )
}
