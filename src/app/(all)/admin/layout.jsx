'use client'
import { useEffect, useState } from 'react'
import Breadcrumbs from '@/components/Breadcrumbs'
import Sidebar from '@/components/admin-panel/Sidebar';
import Header from '@/components/admin-panel/Header';
import Modal from '@/components/admin-panel/Modal';
import { useSelector } from 'react-redux';
import Alert from '@/components/admin-panel/Alert';

export default function AdminLayout({ children }) {
    const { isOpen: modalIsOpen, props: modalProps } = useSelector(state => state.modal) ?? { modalIsOpen: false, modalProps: {} };
    const { isOpen: alertIsOpen, props: alertProps } = useSelector(state => state.alert) ?? { alertIsOpen: false, alertProps: {} };

    return (
        <div className='w-screen h-screen flex flex-row'>
            <Sidebar />
            <div className='flex flex-col pt-4 px-8 w-full overflow-y-auto pb-16'>
                <Alert isOpen={alertIsOpen} {...alertProps} />
                <Header />
                <Breadcrumbs />
                {children}
                <Modal isOpen={modalIsOpen} {...modalProps} />
            </div>
        </div>
    )
}