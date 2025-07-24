import Breadcrumbs from '@/components/Breadcrumbs'
import { Suspense } from 'react'

export default function MaxWidthLayout({ children }) {
	return (
		<div className='max-w-screen-2xl w-full m-auto sm:mx-8 mx-4 sm:pt-8 pt-4'>
			<Suspense>
				<Breadcrumbs homeElement={'Главная'} />
				{children}
			</Suspense>
		</div>
	)
}
