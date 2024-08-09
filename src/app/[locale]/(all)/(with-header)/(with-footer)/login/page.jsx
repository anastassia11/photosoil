'use client'

import { auth } from '@/api/account/login';
import Link from 'next/link'
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Oval } from 'react-loader-spinner';

export default function LoginPage() {
    const [isPasswordHidden, setPasswordHidden] = useState(true);
    const [userData, setUserData] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const result = await auth(userData);
        if (result.success) {
            localStorage.setItem('email', userData.email)
            router.push('/admin')
        } else {
            if (result.status === 400) {
                setIsLoading(false)
            }
        }
    }

    return (
        <div className="sm:space-y-6 sm:max-w-md m-auto sm:mt-24 w-full">
            <div className="text-center">
                <div className="mt-5 space-y-2">
                    <h3 className="sm:text-2xl text-xl font-semibold">Авторизация</h3>
                    <p className="">Еще нет аккаунта? <Link href={`/join`}
                        className='text-blue-600 hover:underline duration-300'>Стать автором</Link></p>
                </div>
            </div>
            <div className="sm:bg-white sm:shadow p-4 py-6 sm:p-6 sm:rounded-lg">
                <form
                    onSubmit={handleFormSubmit}
                    className="space-y-5">
                    <div>
                        <label for="email" className="font-medium">
                            Логин
                        </label>
                        <input
                            id='email' name='email' type="email"
                            value={userData.email}
                            onChange={e => setUserData(prev => ({ ...prev, email: e.target.value }))}
                            required
                            className="sm:bg-none bg-white w-full mt-2 px-3 py-2 bg-transparent outline-none border focus:border-blue-600 shadow-sm rounded-lg"
                        />
                    </div>
                    <div>
                        <label for="password" className="font-medium">
                            Пароль
                        </label >
                        <div className="relative">
                            <button type='button' className="text-gray-400 absolute right-3 inset-y-0 my-auto active:text-gray-600"
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
                            <input required
                                id='password' name='password'
                                value={userData.password}
                                onChange={e => setUserData(prev => ({ ...prev, password: e.target.value }))}
                                type={isPasswordHidden ? "password" : "text"}
                                className="sm:bg-none bg-white w-full mt-1 p-2 outline-none border focus:border-blue-600 shadow-sm rounded-md"
                            />
                        </div>
                    </div>
                    <button type='submit'
                        disabled={isLoading}
                        className="flex items-center justify-center w-full min-h-[40px] py-2 mt-3 font-medium tracking-wide text-white capitalize transition-colors duration-300 transform 
                                    bg-blue-600 rounded-lg hover:bg-blue-500 focus:outline-none active:bg-blue-600 sm:mt-0">
                        {isLoading ?
                            <Oval
                                height={20}
                                width={20}
                                color="#FFFFFF"
                                visible={true}
                                ariaLabel='oval-loading'
                                secondaryColor="#FFFFFF"
                                strokeWidth={4}
                                strokeWidthSecondary={4} />
                            : 'Войти'}
                    </button>
                </form>
            </div>
        </div>
    )
}
