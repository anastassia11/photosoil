'use client'

import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { useTranslation } from 'react-i18next';

export default function AboutPageComponent() {
    const { t } = useTranslation();

    return (
        <div className='flex flex-col sm:space-y-24 space-y-12 items-center w-full'>
            <div className='h-[600px] bg-zinc-400 w-full overflow-hidden flex items-center justify-center'>
                <div className='flex flex-col space-y-4 max-w-screen-xl mx-8 m-auto w-full h-full justify-center relative'>
                    <h2 className='text-center lg:text-left z-10 sm:text-5xl text-4xl font-bold text-white'>
                        {t('visual_database')} <br className='sm:block hidden'></br>
                        <span className='text-blue-700'>{t('soils_ecosystems')}</span>
                    </h2>
                    <p className='text-center lg:text-left lg:w-[700px] pb-2 z-10 sm:text-xl text-lg text-gray-50 sm:font-semibold font-medium'>
                        {t('tagline')}
                    </p>
                    <Image src='/map.png' alt='map' width={2000} height={2000} className='absolute sm:-top-2 top-8 sm:-right-[130px] lg:-right-[330px] scale-150 opacity-55 sm:scale-100 sm:object-scale-down' />
                    <Link href={`/join`} className="lg:w-[200px] w-full px-6 py-2 font-medium text-center text-white transition-colors duration-300 
                transform bg-blue-600 rounded-lg hover:bg-blue-500 focus:outline-none active:bg-blue-600">
                        {t('join')}
                    </Link>
                </div>
            </div>

            <div className='max-w-screen-xl m-auto flex flex-col sm:space-y-24 space-y-12 sm:mx-8 mx-4'>
                <div className=''>
                    <h2 className='sm:text-2xl text-xl font-semibold text-center'>Для чего нужна база даннных PhotoSOIL</h2>
                    <p className='text-base mt-6'>
                        Почвы обладают значительной морфологической изменчивостью даже в пределах одного почвенного типа. Однако многие «почвенные рисунки», создаваемые горизонтными и внегоризонтными почвенными морфологическими элементами, никак не учитываются при классификационной диагностике почв.
                        Почвенные «рисунки» очень трудно охарактеризовать в морфологическом описании, поэтому проще всего их обсуждать, имея под руками качественные фотографии почв.
                        Тормозом в применении цифровых технологий является слабая представленность фотографий почв в сети Интернет. В распоряжении исследователей, как правило, находится личный материал, который не доступен научном сообществу и имеет региональную ограниченность.
                    </p>
                </div>

                <div className='flex sm:flex-row flex-col bg-white p-6 px-8 rounded-2xl border'>
                    <h2 className='sm:text-2xl text-xl font-semibold w-full sm:w-1/3 mb-4 sm:mb-0'>О целях создания</h2>

                    <p className='sm:w-2/3 w-full text-base'>
                        База данных <span className='font-semibold cursor-pointer text-blue-600 transition-all duration-300 hover:underline hover:text-blue-700'>PhotoSOIL</span> призвана стать научной площадкой для исследователей, желающих делиться своими фотографиями почв с теми, кому они могут быть потенциально полезны. Миссия базы данных заключается в оказании содействия развитию сравнительных генетико-географических исследований. Она призвана расширить представления о морфологическом многообразии почв среди почвоведов и натуралистов.
                    </p>
                </div>
                <div>
                    <h2 className='sm:text-2xl text-xl font-semibold text-center'>Содержание и наполнение</h2>
                    <p className='text-base mt-2 text-center text-zinc-500'>
                        База данных состоит из трёх основных разделов
                    </p>


                    <div className='flex lg:flex-row flex-col space-y-4 lg:space-y-0 lg:space-x-4 space-x-0 mt-8'>
                        <div className='flex flex-col bg-white py-6 px-8 rounded-2xl lg:w-1/3 w-full space-y-4 border hover:border-blue-600 duration-300 cursor-pointer'>
                            <h2 className='text-xl font-semibold text-blue-600'>Почвенные профили</h2>
                            <p className='text-base '>
                                Здесь содержатся фотографии почв. Почвы привязаны к карте по месту заложения почвенного разреза. Приведены краткие описания факторов почвообразования, особенностей строения и генезиса почвы. При наличии приводятся дополнительные фотографии элементов строения почвы, её боковых стенок, а также растительных сообществ и ландшафтов.
                            </p>
                            <a href="#" className="flex items-center -mx-1 text-blue-600 transition-colors duration-300 transform  hover:underline hover:text-blue-700 ">
                                <span className="mx-1">Узнать больше</span>
                                <svg className="w-4 h-4 mx-1 rtl:-scale-x-100" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                            </a>
                        </div>
                        <div className='flex flex-col bg-white p-6 px-8 rounded-2xl lg:w-1/3 w-full space-y-4 border hover:border-blue-600 duration-300 cursor-pointer'>
                            <h2 className='text-xl font-semibold text-blue-600'>Почвенные морфологические элементы</h2>
                            <p className='text-base'>
                                Эта категория наполняется фотографиями различных элементов строения почв, от очень малых, которые относятся к области микроморфологии, до имеющих размерность в первые метры. Эти фотографии аналогично первой категории сопровождены краткими описаниями, привязаны к почвенным классификациям и карте.
                            </p>
                            <a href="#" className="flex items-center -mx-1 text-blue-600 transition-colors duration-300 transform  hover:underline hover:text-blue-700 ">
                                <span className="mx-1">Узнать больше</span>
                                <svg className="w-4 h-4 mx-1 rtl:-scale-x-100" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                            </a>
                        </div>
                        <div className='flex flex-col bg-white p-6 px-8 rounded-2xl lg:w-1/3 w-full space-y-4 border hover:border-blue-600 duration-300 cursor-pointer'>
                            <h2 className='text-xl font-semibold text-blue-600'>Динамика почв</h2>
                            <p className='text-base '>
                                Категория создана для размещения фотографий, которые бы явным образом демонстрировали какие-либо быстрые трансформации почв, например, связанные с эрозионными процессами.
                            </p>
                            <a href="#" className="flex items-center -mx-1 text-blue-600 transition-colors duration-300 transform  hover:underline hover:text-blue-700 ">
                                <span className="mx-1">Узнать больше</span>
                                <svg className="w-4 h-4 mx-1 rtl:-scale-x-100" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                            </a>
                        </div>

                    </div>
                </div>
                <div className='flex md:flex-row flex-col bg-white p-6 px-8 rounded-2xl border'>
                    <h2 className='sm:text-2xl text-xl font-semibold md:w-1/3 w-full mb-4 md:mb-0'>Структуризация данных</h2>

                    <p className='md:w-2/3 w-full text-base'>
                        Для структуризации данных используются <span className='cursor-pointer text-blue-600 transition-colors duration-300 hover:underline hover:text-blue-700'>
                            Классификация и диагностика почв России 2004 года</span> с последующими
                        дополнениями и <span className='cursor-pointer text-blue-600 transition-colors duration-300 hover:underline hover:text-blue-700'>Международная классификация почв «World reference
                            base for soil resources 2014»</span>.
                    </p>
                </div>
            </div>
        </div >
    )
}
