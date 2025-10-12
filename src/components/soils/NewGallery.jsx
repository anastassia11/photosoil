'use client'

import '@fancyapps/ui/dist/carousel/carousel.css'
import '@fancyapps/ui/dist/carousel/carousel.thumbs.css'
import '@fancyapps/ui/dist/fancybox/fancybox.css'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import { BASE_SERVER_URL } from '@/utils/constants'

import Carousel from './Carousel'
import FancyBox from './FancyBox'
import '@/styles/gallery.css'

export default function NewGallery({ mainPhoto, objectPhoto }) {
	const [fancyboxIsActive, setFancyboxIsActive] = useState(false)
	const [elements, setElements] = useState([])
	const [page, setPage] = useState(0)

	const { locale } = useParams()

	useEffect(() => {
		if (mainPhoto || objectPhoto) {
			const _elements = []
			if (mainPhoto) {
				_elements.push(mainPhoto)
			}
			if (objectPhoto) {
				_elements.push(...objectPhoto)
			}
			setElements(_elements)
		}
	}, [mainPhoto, objectPhoto])

	return (
		<>
			{elements.length ? (
				<>
					<FancyBox
						length={elements.length}
						setFancyboxIsActive={setFancyboxIsActive}
					>
						<Carousel onPageChange={setPage}>
							{elements?.map(
								({ id, path, pathResize, titleEng, titleRu, lastUpdated, takenDate }) => {
									const date = new Date((takenDate ?? lastUpdated) * 1000).toLocaleDateString()
									return (

										<figure
											key={id}
											className='f-carousel__slide flex flex-col items-center justify-center min-h-full'
											// Миниатюры полноэкранного режима
											data-thumb-src={`${BASE_SERVER_URL}${pathResize.length ? pathResize : path}`}
											data-fancybox='gallery'
											data-title={locale === 'en' ? titleEng : titleRu}
											// Фото полноэкранного режима
											data-src={`${BASE_SERVER_URL}${path}`}
											data-caption={`<div class='flex flex-col h-full'>
                          <p class="text-base font-medium mb-3">${date}</p>
                                <p class='font-light'>${locale === 'en' ? titleEng || '' : locale === 'ru' ? titleRu || '' : ''}</p>
                      </div>`}
										>
											<div className='h-[100%] w-full overflow-hidden opacity-80 absolute inset-0 z-[-1]'>
												{/* Фон */}
												<Image
													priority
													src={`${BASE_SERVER_URL}${pathResize.length ? pathResize : path}`}
													width={500}
													height={500}
													alt='soil'
													className='blur-sm w-full h-full object-cover scale-150'
												/>
											</div>
											<div className='flex flex-col w-full h-full max-w-full max-h-full'>
												<div className='flex-1 min-h-0'>
													<Image
														priority
														src={`${BASE_SERVER_URL}${pathResize.length ? pathResize : path}`}
														width={500}
														height={500}
														alt='soil'
														className='m-auto w-full h-full object-contain self-start'
													/>
												</div>
												<div className='p-4 z-10 h-fit backdrop-blur-md bg-black/40 text-white w-full
                            flex flex-col justify-center'>
													<p className="text-sm font-medium">{date}</p>
													<p className='text-sm line-clamp-2'>{locale === 'en' ? (titleEng || '') : locale === 'ru' ? (titleRu || '') : ''}</p>
												</div>
											</div>
										</figure>
									)
								}
							)}
						</Carousel>
					</FancyBox>
					{/* <div className='p-4 py-2 bg-blue-100 text-blue-700 border border-blue-300 rounded-md mt-2 flex flex-row space-x-4'>
						<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className='w-6 h-6 min-w-6 min-h-6 max-w-6 max-h-6'><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <circle cx="12" cy="12" r="10" stroke="#1d4ed8" stroke-width="1.5"></circle> <path d="M12 17V11" stroke="#1d4ed8" stroke-width="1.5" stroke-linecap="round"></path> <circle cx="1" cy="1" r="1" transform="matrix(1 0 0 -1 11 9)" fill="#1d4ed8"></circle> </g></svg>
						<span className=''>
							<p className="text-base font-medium">{new Date(elements[page].lastUpdated * 1000).toLocaleString()}</p>
							<p className='text-sm line-clamp-3'>{locale === 'en' ? (elements[page].titleEng || '') : locale === 'ru' ? (elements[page].titleRu || '') : ''}</p>
						</span>
					</div> */}
				</>
			) : (
				''
			)}
		</>
	)
}
