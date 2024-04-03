'use client'

import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import LightGallery from 'lightgallery/react';
import lgZoom from 'lightgallery/plugins/zoom';
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-zoom.css';
import 'lightgallery/css/lg-thumbnail.css';
import { BASE_SERVER_URL } from '@/utils/constants';

const Gallery = memo(function Gallery({ mainPhoto, objectPhoto }) {
    const containerRef = useRef(null);
    const [galleryContainer, setGalleryContainer] = useState(null);
    const [elements, setElements] = useState([]);

    useEffect(() => {
        if (containerRef.current) {
            setGalleryContainer('aaa');
        }
    }, []);

    useEffect(() => {
        console.log(mainPhoto, objectPhoto)
        if (mainPhoto || objectPhoto)
            setElements([
                {
                    src: `${BASE_SERVER_URL}${mainPhoto.path}`,
                    thumb: `${BASE_SERVER_URL}${mainPhoto.path}`,
                    subHtml: `<p class="lightGallery-captions">
                                        ${mainPhoto.title}
                                    </p>`,
                }, ...objectPhoto?.map(({ path, }) => (
                    {
                        src: `${BASE_SERVER_URL}${path}`,
                        thumb: `${BASE_SERVER_URL}${path}`,
                        subHtml: `<p class="lightGallery-captions">
                                      Описание фото
                                    </p>`,
                    }
                ))
            ])
    }, [mainPhoto, objectPhoto]);

    useEffect(() => {
        console.log(elements)
    }, [elements]);

    const onInit = useCallback((detail) => {
        if (detail) {
            setTimeout(() => {
                detail.instance.openGallery();
            }, 200);
        }
    }, []);

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