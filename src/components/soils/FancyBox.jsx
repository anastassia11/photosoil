'use client'

import React, { useRef, useEffect, PropsWithChildren } from 'react';
import '@fancyapps/ui/dist/carousel/carousel.css';
import '@fancyapps/ui/dist/fancybox/fancybox.css';
import '@fancyapps/ui/dist/carousel/carousel.thumbs.css';
import { Fancybox as NativeFancybox } from '@fancyapps/ui';
// import '@fancyapps/ui/dist/fancybox/fancybox.css';
import '@/styles/gallery.css';

const defaults = {
    idle: false,
    compact: false,
    dragToClose: false,
    commonCaption: true,
    animated: false,
    showClass: 'f-fadeSlowIn',
    hideClass: false,
    backdropClick: "next",
    contentClick: "next",

    Carousel: {
        infinite: true,
    },

    Images: {
        zoom: false,
        Panzoom: false,
    },

    Toolbar: {
        display: {
            left: ['close', 'zoomIn', 'zoomOut', 'download'],
            middle: [],
            right: ['zoomIn', 'zoomOut', 'download', 'close',],
        },
    },

    Thumbs: {
        type: 'classic',
        Carousel: {
            axis: 'x',

            slidesPerPage: 1,
            Navigation: true,
            center: true,
            fill: true,
            dragFree: true,

            breakpoints: {
                '(min-width: 1024px)': {
                    axis: 'y',
                },
            },
        },
    },
    // on: {
    //     'Carousel.ready Carousel.change': (fancybox) => {
    //         fancybox.container.style.setProperty(
    //             '--bg-image',
    //             `url("${fancybox.getSlide().thumbSrc}")`
    //         );
    //     },
    // },
    tpl: {
        main: `<div class="fancybox__container" role="dialog" aria-modal="true" aria-label="{{MODAL}}" tabindex="-1">
<div class="fancybox__backdrop"></div>
<div class="fancybox__carousel"></div>
<div class="fancybox__caption"></div>
<div class="fancybox__toolbar"></div>
<div class="fancybox__footer"></div>
</div>`,
    },
}

export default function FancyBox(props) {
    const containerRef = useRef(null);
    const setFancyboxIsActive = props.setFancyboxIsActive || undefined;

    if (setFancyboxIsActive) {
        NativeFancybox.defaults.on = {
            init: () => {
                setFancyboxIsActive(true);
            },
            close: () => {
                setFancyboxIsActive(false);
            },
        };
    }
    useEffect(() => {
        const container = containerRef.current;

        const delegate = props.delegate || '[data-fancybox]';
        const options = {
            ...defaults
        };
        // const options = props.options || {};

        NativeFancybox.bind(container, delegate, options);

        return () => {
            NativeFancybox.unbind(container);
            //NativeFancybox.close();
        };
    });

    return <div id="productContainer" className={`${props.length > 1 && 'grid gap-2 lg:grid-cols-[106px_minmax(0px,_1fr)]'}`} ref={containerRef}>{props.children}</div>;
}
