'use client'

import React, { useEffect, useState } from 'react'
import Carousel from './Carousel';
import FancyBox from './FancyBox';
import '@/styles/gallery.css';
import '@fancyapps/ui/dist/carousel/carousel.css';
import '@fancyapps/ui/dist/fancybox/fancybox.css';
import '@fancyapps/ui/dist/carousel/carousel.thumbs.css';
import { BASE_SERVER_URL } from '@/utils/constants';
import { useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';
import moment from 'moment';

export default function NewGallery({ mainPhoto, objectPhoto }) {
    const [fancyboxIsActive, setFancyboxIsActive] = useState(false);
    const [elements, setElements] = useState([]);
    const { locale } = useParams();
    const { t } = useTranslation();

    useEffect(() => {
        // document.documentElement.style.setProperty('--product-view-height', '280px');
        if (mainPhoto || objectPhoto) {
            const _elements = [];
            if (mainPhoto) {
                _elements.push(mainPhoto);
            }
            if (objectPhoto) {
                _elements.push(...objectPhoto);
            }
            setElements(_elements);
        }
    }, [mainPhoto, objectPhoto]);

    return (
        <>
            {elements.length ? <FancyBox length={elements.length}
                setFancyboxIsActive={setFancyboxIsActive}>
                <Carousel>
                    {/* {elements?.map(({ id, path, titleEng, titleRu, lastUpdated }) =>
                        <figure key={id}
                            className="f-carousel__slide max-h-[530px] flex flex-col items-center justify-end"
                            data-thumb-src={`${BASE_SERVER_URL}${path}`}
                            data-fancybox="gallery"
                            data-src={`${BASE_SERVER_URL}${path}`}
                            data-caption={`<div className='flex flex-col h-full'>
                          <p class="text-base font-medium mb-3">${lastUpdated}</p>
                                <p className='text-sm'>${locale === 'en' ? (titleEng || '') : locale === 'ru' ? (titleRu || '') : ''}</p>
                      </div>`}
                        >
                            <div className="absolute inset-0 z-[-1] overflow-hidden">
                                <img className="w-full h-full object-cover blur-[7px] scale-150"
                                    alt=""
                                    src={`${BASE_SERVER_URL}${path}`}
                                />
                            </div>
                            <img className=''
                                alt=""
                                data-lazy-src={`${BASE_SERVER_URL}${path}`}
                            />
                            <figcaption className='p-4 z-10 absolute bottom-0 h-[100px] backdrop-blur-md bg-black bg-opacity-40 text-white w-full
                            flex flex-col justify-center'>
                                <p class="text-base font-medium">{lastUpdated}</p>
                                <p className='text-sm'>{locale === 'en' ? (titleEng || '') : locale === 'ru' ? (titleRu || '') : ''}</p>
                            </figcaption>
                        </figure>)} */}
                    {elements?.map(({ id, path, titleEng, titleRu, lastUpdated }) =>
                        <figure key={id}
                            className="f-carousel__slide flex flex-col items-center justify-center min-h-full"
                            data-thumb-src={`${BASE_SERVER_URL}${path}`}
                            data-fancybox="gallery"
                            data-src={`${BASE_SERVER_URL}${path}`}
                            data-caption={`<div className='flex flex-col h-full'>
                          <p class="text-base font-medium mb-3">${moment(lastUpdated).format('DD.MM.YYYY HH:mm')}</p>
                                <p className='text-sm'>${locale === 'en' ? (titleEng || '') : locale === 'ru' ? (titleRu || '') : ''}</p>
                      </div>`}
                        >
                            <div className="absolute inset-0 z-[-1] overflow-hidden">
                                <Image priority src={`${BASE_SERVER_URL}${path}`} width={500} height={500} alt='soil'
                                    className="w-full h-full object-cover blur-[7px] scale-150 opacity-70" />
                            </div>
                            <Image priority src={`${BASE_SERVER_URL}${path}`} width={500} height={500} alt='soil' />
                            {/* <figcaption className='p-4 z-10 absolute bottom-0 h-[100px] backdrop-blur-md bg-black bg-opacity-40 text-white w-full
                            flex flex-col justify-center'>
                                <p class="text-base font-medium">{lastUpdated}</p>
                                <p className='text-sm'>{locale === 'en' ? (titleEng || '') : locale === 'ru' ? (titleRu || '') : ''}</p>
                            </figcaption> */}
                        </figure>)}
                </Carousel>
            </FancyBox> : ''}
        </>

    );
}
