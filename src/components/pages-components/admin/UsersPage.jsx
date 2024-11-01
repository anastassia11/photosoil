"use client"

import { createAccount } from '@/api/account/create_account';
import { deleteAccount } from '@/api/account/delete_account';
import { getAccounts } from '@/api/account/get_accounts';
import { changeRole } from '@/api/account/change_Role';
import ObjectsView from '@/components/admin-panel/ObjectsView';
import { openAlert } from '@/store/slices/alertSlice';
import { closeModal, openModal } from '@/store/slices/modalSlice';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useConstants } from '@/hooks/useConstants';
import modalThunkActions from '@/store/thunks/modalThunk';
import Input from '@/components/admin-panel/ui-kit/Input';
import { getTranslation } from '@/i18n/client';
import { useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import SubmitBtn from '@/components/admin-panel/ui-kit/SubmitBtn';

export default function UsersPageComponent() {
    const dispatch = useDispatch();
    const [accounts, setAccounts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [formVisible, setFormVisible] = useState(false);

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
        mode: 'onChange'
    });

    const [isPasswordHidden, setPasswordHidden] = useState(true);
    const { locale } = useParams();
    const { t } = getTranslation(locale);
    const { MODERATOR_INFO } = useConstants();

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        const result = await getAccounts()
        if (result.success) {
            setAccounts(result.data);
            setIsLoading(false);
        }
    }

    const fetchDeleteAccount = async (id) => {
        const result = await deleteAccount(id)
        if (result.success) {
            setAccounts(prevAccounts => prevAccounts.filter(account => account.id !== id))
        }
    }

    const handleCreateAccount = async (userData) => {
        const result = await createAccount(userData);
        if (result.success) {
            fetchAccounts();
            dispatch(openAlert({ title: t('success'), message: t('created_account'), type: 'success' }));
        } else {
            dispatch(openAlert({ title: t('error'), message: t('error_account'), type: 'error' }));
        }
        handleCloseForm();
    }

    const handleDeleteClick = async ({ id, isMulti }) => {
        dispatch(openModal({
            title: t('warning'),
            message: isMulti ? t('delete_accounts') : t('delete_account'),
            buttonText: t('delete'),
            type: 'delete'
        }))

        const isConfirm = await dispatch(modalThunkActions.open());
        if (isConfirm.payload) {
            await fetchDeleteAccount(id);
        }
        dispatch(closeModal());
    }

    const handleCloseForm = () => {
        setFormVisible(false);
        reset({});
        setPasswordHidden(true);
    }

    const handleRoleChange = async (userId, isAdmin) => {
        dispatch(openModal({
            title: t('warning'),
            message: isAdmin ? t('will_admin') : t('will_moderator'),
            buttonText: t('confirm')
        }))

        const isConfirm = await dispatch(modalThunkActions.open());
        if (isConfirm.payload) {
            const result = await changeRole(userId, isAdmin);
            if (result.success) {
                setAccounts(prevAccounts => prevAccounts.map(account => account.id === userId ? { ...account, role: isAdmin ? 'Admin' : 'Moderator' } : account))
                dispatch(openAlert({ title: t('success'), message: isAdmin ? t('is_admin') : t('is_moderator'), type: 'success' }));
            } else {
                dispatch(openAlert({ title: t('error'), message: t('error_rights'), type: 'error' }));
            }
        }
        dispatch(closeModal());
    }

    const RegisterForm = () => <form onSubmit={handleSubmit(handleCreateAccount)}
        className="bg-black/30 fixed top-0 left-0 z-50 overflow-y-auto w-screen h-screen">
        <div className="flex items-center h-full justify-center px-4 pt-4 pb-20 lg:ml-[290px] text-center">
            <div className="relative inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all 
                transform bg-white rounded-lg shadow-xl sm:my-8 w-full sm:max-w-md sm:p-6 sm:align-middle">
                <h3 className="text-center text-lg font-medium leading-6 text-gray-800 capitalize" id="modal-title">
                    {t('register')}
                </h3>
                <ul className='my-2 space-y-3'>
                    {MODERATOR_INFO.map(({ title, name }) => <li key={name}>
                        <Input
                            required={name === 'email'}
                            error={errors[name]}
                            label={title}
                            {...register(name,
                                {
                                    required: name === 'email' ? t('required') : false,
                                    pattern: name === 'email' ? {
                                        value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                                        message: t('invalid_email')
                                    } : false
                                })}
                        />
                    </li>)}
                    <div className="relative">
                        <button type='button' className="text-gray-400 absolute right-3 top-9 active:text-gray-600"
                            onClick={() => setPasswordHidden(!isPasswordHidden)}>
                            {
                                !isPasswordHidden ? (
                                    <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                    </svg>
                                )
                            }
                        </button>
                        <Input
                            required={true}
                            error={errors.password}
                            label={t('password')}
                            type={isPasswordHidden ? "password" : "text"}
                            {...register('password',
                                {
                                    required: t('required'),
                                    minLength: {
                                        value: 8,
                                        message: t('password_check')
                                    }
                                })}
                        />
                    </div>
                </ul>
                <div className="mt-8">
                    <div className="mt-4 sm:flex sm:items-center sm:-mx-2 space-y-2 sm:space-y-0">
                        <button type='button' onClick={handleCloseForm} className="w-full px-4 py-2 font-medium tracking-wide text-gray-700 capitalize transition-colors duration-300 transform border border-gray-200 rounded-md sm:w-1/2 sm:mx-2 focus:outline-none">
                            {t('cancel')}
                        </button>
                        <div className='md:min-w-[200px] md:w-fit'>
                            <SubmitBtn isSubmitting={isSubmitting} btnText={t('register_go')} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </form>

    return (
        <div className="flex flex-col w-fill space-y-4">
            <div className='flex flex-row justify-between items-center'>
                <h1 className='sm:text-2xl text-xl font-semibold'>
                    {t('users')}
                </h1>
                {formVisible ? RegisterForm() : ''}
                <button className="w-fit sm:px-8 px-2 py-2 font-medium text-center text-white transition-colors duration-300 
                transform bg-blue-600 rounded-lg hover:bg-blue-500 focus:outline-none active:bg-blue-600"
                    onClick={() => setFormVisible(true)}>
                    {t('create_account')}
                </button>
            </div>
            <ObjectsView _objects={accounts} onDeleteClick={handleDeleteClick}
                pathname='' onRoleChange={handleRoleChange} objectType='users' isLoading={isLoading} />
        </div>
    );
}
