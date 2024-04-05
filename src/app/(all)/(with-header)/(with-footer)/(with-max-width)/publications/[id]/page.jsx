import MapPointView from '@/components/map/MapPointView'
import React from 'react'

export default function PublicationPage({ params: { id } }) {
    return (
        <div className='flex flex-col'>
            <h1 className='text-2xl font-semibold mb-2'>
                Математическое моделирование взаимодействия одиночной сверхзвуковой струи с подвижной преградой
            </h1>
            <div className='space-y-1'>
                <p className='text-gray-600'>Kagenov, A.M., Kostyushin, K.V., Chervakova, A.V., Eremin, I.V.</p>
                <p className='text-gray-600 font-medium'>Vestnik Tomskogo Gosudarstvennogo Universiteta, Matematika i Mekhanika, 2022, (78), страницы 49–59</p>
            </div>
            <div className='flex flex-row space-x-8 mt-6'>
                <div className='w-1/2'>
                    <div id='map-section' className='border rounded-lg overflow-hidden'>
                        <div className='relative w-full aspect-[2/1]'>
                            <MapPointView latitude={64} longtitude={57} />
                            {/* <div className='z-20 absolute top-[calc(50%-112px)] right-0'>
                        <Zoom />
                    </div> */}
                        </div>
                    </div>
                </div>
                <div className='w-1/2'>
                    <div className='flex flex-col space-y-2'>
                        <div className='flex flex-row w-full space-x-4'>
                            <span className=' text-zinc-500 font-semibold'>
                                DOI
                            </span>
                            <span>
                                10.1088/2053-1583/ad2f44
                            </span>
                        </div>
                        <div className='flex flex-col w-full'>
                            <span className=' text-zinc-500 font-semibold'>
                                Аннотация
                            </span>
                            <span >
                                To gain access to this content, please complete the Recommendation Form and we will follow up with your librarian or Institution on your behalf.

                                For corporate researchers we can also follow up directly with your R&D manager, or the information management contact at your company. Institutional subscribers have access to the current volume, plus a 10-year back file (where available).
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div id='ecosystems-section'>
                <h3 className='text-2xl font-semibold mt-8'>
                    Экосистемы
                </h3>
            </div>
            <div id='publications-section'>
                <h3 className='text-2xl font-semibold mt-8'>
                    Публикации
                </h3>
            </div>
        </div>
    )
}
