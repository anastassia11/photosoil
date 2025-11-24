'use client'

import { Fancybox as NativeFancybox } from '@fancyapps/ui'
import '@fancyapps/ui/dist/carousel/carousel.css'
import '@fancyapps/ui/dist/carousel/carousel.thumbs.css'
import '@fancyapps/ui/dist/fancybox/fancybox.css'
import React, { useEffect, useRef } from 'react'

import { generateFileName } from '@/utils/common'

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
		items: {
			customDownload: {
				tpl: `<button type='button' class="f-button"><svg tabindex="-1" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M7 11l5 5 5-5M12 4v12"></path></svg></button>`,
				click: async () => {
					const instance = NativeFancybox.getInstance()
					const currentSlide = instance.getSlide()

					const imageUrl = currentSlide.src
					const fileName = generateFileName(currentSlide.title?.length
						? currentSlide.title
						: imageUrl.split('/').pop())

					const response = await fetch(imageUrl)
					const blob = await response.blob()
					const url = window.URL.createObjectURL(blob)

					const a = document.createElement('a')
					a.href = url
					a.download = fileName
					a.click()

					window.URL.revokeObjectURL(url)
				}
			}
		},
		display: {
			left: ['close', 'zoomIn', 'zoomOut', 'customDownload'],
			middle: [],
			right: ['zoomIn', 'zoomOut', 'customDownload', 'close']
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
</div>`,
		customDownload:
			'<button class="fancybox__button--custom-download" title="Download">gg</button>'
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

	useEffect(() => {
		const container = containerRef.current

		const delegate = props.delegate || '[data-fancybox]'
		const options = {
			...defaults
		}
		NativeFancybox.bind(container, delegate, options)

		return () => {
			NativeFancybox.unbind(container)
		}
	})

	return (
		<div
			id='productContainer'
			className={`${props.length > 1 && 'grid gap-2 lg:grid-cols-[106px_minmax(0px,_1fr)] min-h-full'}`}
			ref={containerRef}
		>
			{props.children}
		</div>
	)
}
