import Image from 'next/image'
import Link from 'next/link'
import { memo } from 'react'

const Logo = memo(function Logo({ locale }) {
	return (
		<Link
			href={`/${locale}`}
			prefetch={false}
			className='flex flex-row items-center w-fit'
		>
			<Image
				src={'/logo.png'}
				width={300}
				height={300}
				alt='logo'
				className='sm:w-9 w-8'
			/>
			<p className='text-zinc-600 ml-2 sm:text-3xl text-2xl font-semibold'>
				Photo<span className='pl-[2px] text-[#226eaf] font-bold'>SOIL</span>
			</p>
		</Link>
	)
})
export default Logo
