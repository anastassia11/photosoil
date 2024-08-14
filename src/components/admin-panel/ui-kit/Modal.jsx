'use client'

import { useTranslation } from '@/i18n/client';
import { closeModal, setConfirm } from '@/store/slices/modalSlice';
import { useParams } from 'next/navigation';
import { useDispatch } from 'react-redux';

export default function Modal({ isOpen, title, message, buttonText }) {
    const dispatch = useDispatch();
    const { locale } = useParams();
    const { t } = useTranslation(locale);

    return (
        <div className='modal'>
            {isOpen && (
                <div className="bg-black/30 fixed top-0 left-0 z-50 overflow-y-auto w-screen h-screen" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-center h-full justify-center px-4 pt-4 pb-20 lg:ml-[290px] text-center">
                        <div className="relative inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:w-full sm:max-w-md sm:p-6 sm:align-middle">
                            <h3 className="text-lg font-medium leading-6 text-gray-800 capitalize" id="modal-title">
                                {title}
                            </h3>
                            <p className="mt-2 text-gray-500">
                                {message}
                            </p>

                            <div className="mt-4">
                                <div className="mt-4 sm:flex sm:items-center sm:-mx-2">
                                    <button onClick={() => dispatch(closeModal())} className="modal w-full px-4 py-2 font-medium tracking-wide text-gray-700 capitalize transition-colors duration-300 transform border border-gray-200 rounded-md sm:w-1/2 sm:mx-2 focus:outline-none">
                                        {t('cancel')}
                                    </button>


                                    <button className="modal w-full px-4 py-2 mt-3 font-medium tracking-wide text-white capitalize transition-colors duration-300 transform 
                                    bg-blue-600 rounded-lg hover:bg-blue-500 focus:outline-none active:bg-blue-600 sm:mt-0 sm:w-1/2 sm:mx-2"
                                        onClick={() => dispatch(setConfirm())} >
                                        {buttonText}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
            }
        </div>
    )
}
