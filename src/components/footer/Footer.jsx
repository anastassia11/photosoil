import { useTranslation } from '@/i18n';
import Image from 'next/image'

export default async function Footer({ locale }) {
    const { t } = await useTranslation(locale);

    return (
        <footer className='absolute bottom-0 border-t w-full mt-24 flex xl:flex-row flex-col xl:space-x-6 justify-between xl:items-start items-center px-8 py-6'>
            <div className='my-auto hidden xl:block'>
                <div className='flex-1 flex flex-row items-center'>
                    <Image src={'/logo.png'} width={300} height={300} alt='logo' className='w-9' />
                    <p className='text-zinc-600 ml-2 text-3xl font-semibold'>Photo<span className='pl-[2px] text-[#226eaf] font-bold'>SOIL</span></p>
                </div>
            </div>


            <div className='flex-1 flex flex-col sm:flex-row xl:justify-evenly justify-between w-full space-y-4 sm:space-y-0'>
                <span className='flex flex-col space-y-1 items-center sm:items-start'>
                    <p className='text-lg text-blue-700'>{t('main_editor')}</p>
                    <p>{t('kulizhsky')}</p>
                    <a className="flex items-center gap-1.5"
                        href="mailto:kulizhskiy@yandex.ru" >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="size-5 shrink-0 text-zinc-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                        </svg>
                        <span>kulizhskiy@yandex.ru</span>
                    </a>
                </span>
                <span className='flex flex-col space-y-1 items-center sm:items-start'>
                    <p className='text-lg text-blue-700'>{t('executive_editor')}</p>
                    <p>{t('loiko')}</p>
                    <a className="flex items-center gap-1.5"
                        href="mailto:s.loyko@yandex.ru" >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="size-5 shrink-0 text-zinc-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                        </svg>
                        <span>s.loyko@yandex.ru</span>
                    </a>
                </span>
                <div className='md:flex hidden xl:hidden flex-col sm:items-center md:items-end space-y-2 xl:mt-0 mt-4'>
                    <p className='text-lg text-blue-700'>{t('social_media')}</p>
                    <div className='flex flex-row items-center text-zinc-600 space-x-4'>
                        <a className="flex items-center gap-1.5"
                            href="https://t.me/Photosoil" target="_blank">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width={800}
                                height={800}
                                viewBox="0 0 32 32"
                                className='w-8 h-8'
                                fill="currentColor"
                            >
                                <path d="M16 .5C7.437.5.5 7.438.5 16S7.438 31.5 16 31.5c8.563 0 15.5-6.938 15.5-15.5S24.562.5 16 .5zm7.613 10.619-2.544 11.988c-.188.85-.694 1.056-1.4.656l-3.875-2.856-1.869 1.8c-.206.206-.381.381-.781.381l.275-3.944 7.181-6.488c.313-.275-.069-.431-.482-.156l-8.875 5.587-3.825-1.194c-.831-.262-.85-.831.175-1.231l14.944-5.763c.694-.25 1.3.169 1.075 1.219z" />
                            </svg>
                        </a>

                        <a className="flex items-center gap-1.5"
                            href="https://www.youtube.com/@photosoil" target="_blank">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width={800}
                                height={800}
                                fill="none"
                                viewBox="0 0 48 48"
                                className='w-9 h-9'
                            >
                                <circle cx={24} cy={24} r={20} fill="currentColor" />
                                <path
                                    fill="#fff"
                                    fillRule="evenodd"
                                    d="M35.3 16.378c.4.4.687.896.835 1.44.849 3.418.652 8.814.016 12.363a3.23 3.23 0 0 1-2.275 2.275C31.882 33 23.854 33 23.854 33s-8.027 0-10.022-.544a3.23 3.23 0 0 1-2.274-2.275c-.854-3.402-.62-8.802-.017-12.346a3.23 3.23 0 0 1 2.275-2.275c1.994-.543 10.022-.56 10.022-.56s8.027 0 10.022.544a3.23 3.23 0 0 1 1.44.834ZM27.942 24l-6.659 3.857v-7.714L27.943 24Z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </a>
                    </div>
                </div>


            </div>

            <div className='flex md:hidden xl:flex flex-col justify-between xl:items-end items-center space-y-2 xl:mt-0 mt-4'>
                <p className='text-lg text-blue-700'>{t('social_media')}</p>
                <div className='flex flex-row items-center text-zinc-600 space-x-4'>
                    <a className="flex items-center gap-1.5"
                        href="https://t.me/Photosoil" target="_blank">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width={800}
                            height={800}
                            viewBox="0 0 32 32"
                            className='w-8 h-8'
                            fill="currentColor"
                        >
                            <path d="M16 .5C7.437.5.5 7.438.5 16S7.438 31.5 16 31.5c8.563 0 15.5-6.938 15.5-15.5S24.562.5 16 .5zm7.613 10.619-2.544 11.988c-.188.85-.694 1.056-1.4.656l-3.875-2.856-1.869 1.8c-.206.206-.381.381-.781.381l.275-3.944 7.181-6.488c.313-.275-.069-.431-.482-.156l-8.875 5.587-3.825-1.194c-.831-.262-.85-.831.175-1.231l14.944-5.763c.694-.25 1.3.169 1.075 1.219z" />
                        </svg>
                    </a>

                    <a className="flex items-center gap-1.5"
                        href="https://www.youtube.com/@photosoil" target="_blank">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width={800}
                            height={800}
                            fill="none"
                            viewBox="0 0 48 48"
                            className='w-9 h-9'
                        >
                            <circle cx={24} cy={24} r={20} fill="currentColor" />
                            <path
                                fill="#fff"
                                fillRule="evenodd"
                                d="M35.3 16.378c.4.4.687.896.835 1.44.849 3.418.652 8.814.016 12.363a3.23 3.23 0 0 1-2.275 2.275C31.882 33 23.854 33 23.854 33s-8.027 0-10.022-.544a3.23 3.23 0 0 1-2.274-2.275c-.854-3.402-.62-8.802-.017-12.346a3.23 3.23 0 0 1 2.275-2.275c1.994-.543 10.022-.56 10.022-.56s8.027 0 10.022.544a3.23 3.23 0 0 1 1.44.834ZM27.942 24l-6.659 3.857v-7.714L27.943 24Z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </a>
                </div>
            </div>

        </footer>
    )
}
