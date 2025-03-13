'use client'

import { Fancybox as NativeFancybox } from '@fancyapps/ui'
import '@fancyapps/ui/dist/carousel/carousel.css'
import '@fancyapps/ui/dist/carousel/carousel.thumbs.css'
import '@fancyapps/ui/dist/fancybox/fancybox.css'
import React, { PropsWithChildren, useEffect, useRef } from 'react'

// import '@fancyapps/ui/dist/fancybox/fancybox.css';
import '@/styles/gallery.css'

const defaults = {
	idle: false,
	compact: false,
	dragToClose: false,
	commonCaption: true,
	animated: false,
	showClass: 'f-fadeSlowIn',
	hideClass: false,
	backdropClick: 'next',
	contentClick: 'next',

	Carousel: {
		infinite: true
	},

	Images: {
		zoom: false,
		Panzoom: false
	},

	Toolbar: {
		display: {
			left: ['close', 'zoomIn', 'zoomOut', 'download'],
			middle: [],
			right: ['zoomIn', 'zoomOut', 'download', 'close']
		}
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
					axis: 'y'
				}
			}
		}
	},
	tpl: {
		main: `<div class="fancybox__container" role="dialog" aria-modal="true" aria-label="{{MODAL}}" tabindex="-1">
<div class="fancybox__backdrop"></div>
<div class="fancybox__carousel"></div>
<div class="fancybox__caption"></div>
<div class="fancybox__toolbar"></div>
<div class="fancybox__footer"></div>
</div>`
	}
}

export default function FancyBox(props) {
	const containerRef = useRef(null)
	const setFancyboxIsActive = props.setFancyboxIsActive || undefined

	if (setFancyboxIsActive) {
		NativeFancybox.defaults.on = {
			init: () => {
				setFancyboxIsActive(true)
			},
			close: () => {
				setFancyboxIsActive(false)
			}
		}
	}

	// Функция для скачивания изображения
	const downloadImage = (imageUrl, imageName) => {
		const link = document.createElement('a')
		link.href = imageUrl
		link.download = imageName || 'image.jpg' // Имя файла
		document.body.appendChild(link)
		link.click()
		document.body.removeChild(link)
	}

	useEffect(() => {
		const container = containerRef.current

		const delegate = props.delegate || '[data-fancybox]'
		const options = {
			...defaults,
			// on: {
			// 	afterShow: (fancybox, slide) => {
			// 		const downloadButton = fancybox.container.querySelector('[data-fancybox-download]')
			// 		if (downloadButton) {
			// 			downloadButton.addEventListener('click', () => {
			// 				const imageUrl = slide.src // URL текущего изображения
			// 				const imageName = imageUrl.split('/').pop() // Имя файла из URL
			// 				downloadImage(imageUrl, imageName) // Скачивание изображения
			// 			})
			// 		}
			// 	},
			// },
			// Toolbar: {
			// 	...defaults.Toolbar,
			// 	items: {
			// 		...defaults.Toolbar.items,
			// 		download: {
			// 			tpl: `<button class="f-button" title="Download" data-fancybox-download><svg tabindex="-1" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M7 11l5 5 5-5M12 4v12"></path></svg></button>`,
			// 			click: (fancybox, button) => {
			// 				console.log(fancybox)
			// 				const currentSlide = fancybox.getCarousel().getSlide()
			// 				const imageUrl = currentSlide.src // URL текущего изображения
			// 				const imageName = imageUrl.split('/').pop() // Имя файла из URL
			// 				downloadImage(imageUrl, imageName) // Скачивание изображения
			// 			}
			// 		}
			// 	}
			// }
		}
		// const options = props.options || {};

		NativeFancybox.bind(container, delegate, options)

		return () => {
			NativeFancybox.unbind(container)
			//NativeFancybox.close();
		}
	})

	return (
		<div
			id='productContainer'
			className={`${props.length > 1 && 'grid gap-2 lg:grid-cols-[106px_minmax(0px,_1fr)]'}`}
			ref={containerRef}
		>
			{props.children}
		</div>
	)
}
