
import Breadcrumbs from '@/components/Breadcrumbs'
import React from 'react'

export default function MaxWidthLayout({ children }) {
    return (
        <div className='max-w-screen-2xl w-full m-auto sm:mx-8 mx-4 pt-8'>
            <Breadcrumbs homeElement={'Главная'} />
            {children}
        </div>
    )
}
