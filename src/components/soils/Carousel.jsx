'use client'

import { Carousel as NativeCarousel } from '@fancyapps/ui'
import '@fancyapps/ui/dist/carousel/carousel.css'
import '@fancyapps/ui/dist/carousel/carousel.thumbs.css'
import { Thumbs } from '@fancyapps/ui/dist/carousel/carousel.thumbs.esm.js'
import '@fancyapps/ui/dist/fancybox/fancybox.css'
import React, { useEffect, useRef } from 'react'

import '@/styles/gallery.css'

const defaults = {
	infinite: true,
	Dots: false,
	Thumbs: {
		type: 'classic',
		Carousel: {
			slidesPerPage: 1,
			Navigation: true,
			center: true,
			fill: true,
			dragFree: true,
			axis: 'x',
			breakpoints: {
				'(min-width: 1024px)': {
					axis: 'y'
				}
			}
		}
	}
}

export default function Carousel(props) {
	const containerRef = useRef(null)

	useEffect(() => {
		const container = containerRef.current
		const options = {
			...defaults
		}

		const instance = new NativeCarousel(container, options, { Thumbs })

		return () => {
			instance.destroy()
		}
	}, [])

	return (
		<div
			id='productCarousel'
			className='f-carousel lg:order-last'
			ref={containerRef}
		>
			{props.children}
		</div>
	)
}
