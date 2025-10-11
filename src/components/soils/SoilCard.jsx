import Image from 'next/image'
import Link from 'next/link'
import React, { memo } from 'react'

import { BASE_SERVER_URL } from '@/utils/constants'

const SoilCard = memo(
	function SoilCard({ locale, type, photo, name, id }) {
		return (
			<Link
				href={{
					pathname: `/${locale}/${type}/${id}`,
					query: {}
				}}
				prefetch={false}
				className='relative aspect-[2/3] overflow-hidden transition-all
    rounded-md  hover:ring ring-blue-700 ring-opacity-30 hover:scale-[1.006] flex flex-col  duration-300 cursor-pointer'
			>
				<div className='h-[100%] w-full overflow-hidden opacity-80'>
					<Image
						src={`${BASE_SERVER_URL}${photo.pathResize.length ? photo.pathResize : photo.path}`}
						width={500}
						height={500}
						alt='soil'
						className='blur-sm w-full h-full object-cover scale-150'
					/>
				</div>

				<div className='h-[77%] absolute top-0 w-full flex'>
					<Image
						src={`${BASE_SERVER_URL}${photo.pathResize.length ? photo.pathResize : photo.path}`}
						width={500}
						height={500}
						alt='soil'
						className='m-auto w-full h-full object-contain self-start'
					/>
				</div>
				<div className='rounded-b-md flex p-4 items-start text-sm font-medium z-10 absolute bottom-0 h-[24%] backdrop-blur-md bg-black/40 text-white w-full'>
					<p className='max-h-full overflow-hidden max-w-full'>{name}</p>
				</div>
			</Link>
		)
	},
	(prevProps, nextProps) => {
		return (
			prevProps.locale === nextProps.locale &&
			prevProps.type === nextProps.type &&
			prevProps.photo === nextProps.photo &&
			prevProps.name === nextProps.name &&
			prevProps.id === nextProps.id
		)
	}
)
export default SoilCard
