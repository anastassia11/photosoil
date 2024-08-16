'use client'

import React, { useEffect, useRef } from 'react';
import LightGallery from 'lightgallery/react';
import lgZoom from 'lightgallery/plugins/zoom';
import lgVideo from 'lightgallery/plugins/video';
import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-zoom.css';
import 'lightgallery/css/lg-video.css';
import { BASE_SERVER_URL } from '@/utils/constants';
import { useParams } from 'next/navigation';
import { getTranslation } from '@/i18n/client';

export default function PdfGallery({ path, title }) {
    const { locale } = useParams();
    const { t } = getTranslation(locale);

    return (
        <div className="">
            <LightGallery
                download={false}
                counter={false}
                slideEndAnimation={false} plugins={[lgVideo]}
            >
                {/* <a
                    data-lg-size="1400-1400"
                    className="gallery-item cursor-pointer"
                    data-iframe="true"
                    data-src="https://www.lightgalleryjs.com/pdf/sample.pdf">
                    cvbgn
                </a> */}
                <a
                    className="flex flex-row text-blue-700 hover:underline duration-300 cursor-pointer"
                    data-iframe="true"
                    data-src={`${BASE_SERVER_URL}${path}`}
                >
                    <img className='hidden' />
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        xmlSpace="preserve"
                        viewBox="0 246.6 595.3 595.3"
                        className='w-5 h-5 mr-1'
                    >
                        <path
                            fill="#999"
                            d="M511.3 841.9H46.9C21 841.9 0 822.3 0 798.2V290.3c0-24.1 21-43.7 46.9-43.7h464.4c25.9 0 46.9 19.6 46.9 43.7v507.9c0 24.2-21.1 43.7-46.9 43.7zM46.9 283.3c-4.2 0-7.6 3.3-7.6 7.1v507.9c0 3.9 3.5 7.1 7.6 7.1h464.4c4.2 0 7.6-3.3 7.6-7.1V290.4c0-3.9-3.5-7.1-7.6-7.1H46.9z"
                        />
                        <path
                            fill="#FFF"
                            d="M511.3 805.3c4.2 0 7.6-3.3 7.6-7.1V290.3c0-3.9-3.5-7.1-7.6-7.1H46.9c-4.2 0-7.6 3.3-7.6 7.1v507.9c0 3.9 3.5 7.1 7.6 7.1h464.4z"
                        />
                        <path fill="#006EB2" d="M112.4 366.4H446v37.8H112.4z" />
                        <path
                            fill="#999"
                            d="M112.4 445.9h202.8v37.8H112.4zM112.4 525.4h202.8v37.8H112.4zM112.4 605.1h202.8v37.8H112.4zM112.4 684.5h202.8v37.8H112.4z"
                        />
                        <path fill="#CCC" d="M364.9 445.9h81.2v117.8h-81.2z" />
                    </svg>
                    {title || t('view')}
                </a>
            </LightGallery>
        </div>
    );
}
