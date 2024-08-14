'use client'

import Link from 'next/link'
import React from 'react'
import { useTranslation } from 'react-i18next';

export default function JoinForm() {
    const { t } = useTranslation();

    return (
        <div className="sm:space-y-6 sm:max-w-md m-auto sm:mt-16">
            <div className="text-center">
                <div className="mt-5 space-y-2">
                    <h3 className="sm:text-2xl text-xl font-semibold">{t('join')}</h3>
                    <p className="">{t('join_text')}<br />
                        {t('account_exists')} <Link className='text-blue-600 hover:underline duration-300'
                            href='/login'>{t('login')}</Link></p>
                </div>
            </div>
            <div className="sm:bg-white sm:shadow p-4 py-6 sm:p-6 sm:rounded-lg">
                <form
                    onSubmit={(e) => e.preventDefault()}
                    className="space-y-5"
                >
                    <div>
                        <label className="font-medium">
                            {t('full_name')}
                        </label>
                        <input
                            type="text"
                            required
                            className="sm:bg-none bg-white w-full mt-2 px-3 py-2 bg-transparent outline-none border focus:border-blue-600 shadow-sm rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="font-medium">
                            {t('organization')}
                        </label>
                        <input
                            type="email"
                            required
                            className="sm:bg-none bg-white w-full mt-2 px-3 py-2 bg-transparent outline-none border focus:border-blue-600 shadow-sm rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="font-medium">
                            {t('post')}
                        </label>
                        <input
                            type="password"
                            required
                            className="sm:bg-none bg-white w-full mt-2 px-3 py-2 bg-transparent outline-none border focus:border-blue-600 shadow-sm rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="font-medium">
                            {t('email')}
                        </label>
                        <input
                            type="password"
                            required
                            className="sm:bg-none bg-white w-full mt-2 px-3 py-2 bg-transparent outline-none border focus:border-blue-600 shadow-sm rounded-lg"
                        />
                    </div>
                    <button
                        className="w-full px-4 py-2 text-white font-medium bg-blue-600 hover:bg-blue-500 active:bg-blue-600 rounded-lg duration-150"
                    >
                        {t('submit')}
                    </button>
                </form>
            </div>
        </div>
    )
}
