'use client'

import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import LightGallery from 'lightgallery/react/Lightgallery.es5';
import lgZoom from 'lightgallery/plugins/zoom';
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-zoom.css';
import 'lightgallery/css/lg-thumbnail.css';
// import '@/styles/gallery.css';
import { BASE_SERVER_URL } from '@/utils/constants';
import { useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';

const Gallery = memo(function Gallery({ mainPhoto, objectPhoto }) {
    const containerRef = useRef(null);
    const [galleryContainer, setGalleryContainer] = useState(null);
    const [elements, setElements] = useState([]);
    const { locale } = useParams();
    const { t } = useTranslation();

    useEffect(() => {
        if (containerRef.current) {
            setGalleryContainer('aaa');
        }
    }, []);

    useEffect(() => {
        if (mainPhoto || objectPhoto)
            setElements([
                {
                    src: `${BASE_SERVER_URL}${mainPhoto.path}`,
                    thumb: `${BASE_SERVER_URL}${mainPhoto.path}`,
                    subHtml: `<div class="lightGallery-captions">
                          <h4>${mainPhoto.lastUpdated}</h4>
                          <p>${locale === 'en' ? (mainPhoto.titleEng || '') : locale === 'ru' ? (mainPhoto.titleRu || '') : ''}</p>
                      </div>`,
                },
                ...(objectPhoto?.map(({ path, titleEng, titleRu, lastUpdated }) => (
                    {
                        src: `${BASE_SERVER_URL}${path}`,
                        thumb: `${BASE_SERVER_URL}${path}`,
                        subHtml: `<div class="lightGallery-captions">
                          <h4>${lastUpdated}</h4>
                          <p>${locale === 'en' ? (titleEng || '') : locale === 'ru' ? (titleRu || '') : ''}</p>
                      </div>`,
                    }
                )) || [])
            ])
    }, [mainPhoto, objectPhoto]);

    const onInit = useCallback((detail) => {
        if (elements.length) {
            detail.instance.openGallery();
        }
    }, [elements]);

    return (
        <div>
            <div
                style={{
                    height: '600px',
                }}
                ref={containerRef}
            ></div>
            <div>
                <LightGallery
                    container={containerRef.current}
                    onInit={onInit}
                    plugins={[lgZoom, lgThumbnail]}
                    closable={false}
                    showZoomInOutIcons={true}
                    actualSize={false}
                    showMaximizeIcon={true}
                    slideEndAnimation={false}
                    loop={false}
                    hideControlOnEnd={true}
                    thumbHeight={'80px'}
                    thumbMargin={6}
                    appendSubHtmlTo={'.lg-sub-html'}
                    dynamic={true}
                    dynamicEl={elements}
                    hash={false}>
                </LightGallery>
            </div>
        </div>
    );
});
export default Gallery;