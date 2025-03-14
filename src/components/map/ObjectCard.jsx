import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'

import { useConstants } from '@/hooks/useConstants'

import { BASE_SERVER_URL } from '@/utils/constants'

import { getTranslation } from '@/i18n/client'

export default function ObjectCard({ object }) {
	const { locale } = useParams()
	const { t } = getTranslation(locale)
	const { SOIL_ENUM, PUBLICATION_ENUM } = useConstants()

	const currentTransl =
		object.translations?.find(
			({ isEnglish }) => isEnglish === (locale === 'en')
		) || {}

	return (
		<Link
			href={`/${locale}/${object._type}s/${object.id}`}
			prefetch={false}
			className={`flex flex-row hover:bg-zinc-100 duration-300 px-4 ${object._type === 'publication' ? 'py-2' : 'py-3'}`}
		>
			{object._type === 'publication' ? (
				<div className='flex flex-col ml-1 max-w-full'>
					<p className='text-blue-700 text-sm sm:text-base'>
						{PUBLICATION_ENUM[object.type] || ''}
					</p>
					<p className='mt-1 text-sm sm:text-base'>{currentTransl.name}</p>
					<p className='text-gray-600 text-nowrap text-ellipsis max-w-full overflow-hidden mt-1 text-sm sm:text-base'>
						{currentTransl.authors}
					</p>
				</div>
			) : (
				<div className='flex flex-row w-full'>
					{(!!object?.photo?.pathResize || !!object?.photo?.path) && (
						<div className='max-w-[40%] w-[40%]'>
							<Image
								src={`${BASE_SERVER_URL}${object.photo?.pathResize?.length ? object.photo.pathResize : object.photo.path}`}
								className='aspect-[3/4] object-cover object-top border border-blue-600 shadow-md rounded-xl overflow-hidden'
								priority={true}
								placeholder='blur'
								blurDataURL={`${BASE_SERVER_URL}${object.photo?.pathResize?.length ? object.photo.pathResize : object.photo.path}`}
								alt={object?.name || 'object photo'}
								width={200}
								height={200}
							/>
						</div>
					)}
					<div className='flex flex-col ml-2 max-w-[60%] w-[60%]'>
						<p className='text-blue-700 text-sm sm:text-base'>
							{object._type === 'soil'
								? SOIL_ENUM[object.objectType] || ''
								: t(object._type)}
						</p>
						<p className='mt-1 text-sm sm:text-base'>{currentTransl.name}</p>
					</div>
				</div>
			)}
		</Link>
	)
}
