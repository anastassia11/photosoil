'use client'
import { useEffect, useRef, useState } from 'react'
import Breadcrumbs from '@/components/Breadcrumbs'
import Sidebar from '@/components/admin-panel/Sidebar';
import Header from '@/components/admin-panel/Header';
import Modal from '@/components/admin-panel/Modal';
import { useDispatch, useSelector } from 'react-redux';
import Alert from '@/components/admin-panel/Alert';
import { useRouter } from 'next/navigation';
import { closeAlert } from '@/store/slices/alertSlice';

export default function AdminLayout({ children }) {
    const { isOpen, modalProps } = useSelector(state => state.modal);
    const { isOpen: alertIsOpen, props: alertProps } = useSelector(state => state.alert) ?? { alertIsOpen: false, alertProps: {} };
    const token = useRef(null);
    const dispatch = useDispatch();
    const router = useRouter();
    const [isAuth, setIsAuth] = useState(false);
    const [isChecked, setIsChecked] = useState(false);

    useEffect(() => {
        token.current = localStorage.getItem('tokenData') ? JSON.parse(localStorage.getItem('tokenData')).token : null
        if (!token.current) {
            router.push('/login');
            setIsAuth(false);
            setIsChecked(true);
        } else {
            setIsAuth(true);
            setIsChecked(true);
        }
    }, [router])

    useEffect(() => {
        let timer;
        if (alertIsOpen) {
            timer = setTimeout(() => {
                dispatch(closeAlert());
            }, 3000);
        }
        return () => clearTimeout(timer);
    }, [alertIsOpen, dispatch]);

    return (
        <div className='w-screen h-screen flex flex-row'>
            {isChecked ? (
                isAuth ? <><Sidebar />
                    <div className='flex flex-col pt-4 px-8 w-full overflow-y-auto pb-16'>
                        <Alert isOpen={alertIsOpen} {...alertProps} />
                        <Header />
                        <Breadcrumbs />
                        {children}
                        <Modal isOpen={isOpen}  {...modalProps} />
                    </div>
                </> : <></>
            ) : ''}
        </div >
    )
}