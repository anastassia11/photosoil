'use client'

import dynamic from 'next/dynamic'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import Breadcrumbs from '@/components/Breadcrumbs'
import Header from '@/components/admin-panel/Header'
import Sidebar from '@/components/admin-panel/Sidebar'

import { closeAlert } from '@/store/slices/alertSlice'
import { TooltipProvider } from '@/components/ui/tooltip'

const Alert = dynamic(() => import('@/components/admin-panel/ui-kit/Alert'), {
	ssr: false
})
const Modal = dynamic(() => import('@/components/admin-panel/ui-kit/Modal'), {
	ssr: false
})

export default function AdminLayout({ children }) {
	const { isOpen, modalProps } = useSelector(state => state.modal)
	const { isOpen: alertIsOpen, props: alertProps } = useSelector(
		state => state.alert
	) ?? { alertIsOpen: false, alertProps: {} }
	const token = useRef(null)
	const dispatch = useDispatch()
	const router = useRouter()
	const pathname = usePathname()
	const [isAuth, setIsAuth] = useState(false)
	const [isChecked, setIsChecked] = useState(false)
	const [menuOpen, setMenuOpen] = useState(false)

	useEffect(() => {
		token.current = localStorage.getItem('tokenData')
			? JSON.parse(localStorage.getItem('tokenData')).token
			: null
		if (!token.current) {
			router.push('/login')
			setIsAuth(false)
			setIsChecked(true)
		} else {
			setIsAuth(true)
			setIsChecked(true)
		}
		setMenuOpen(false)
	}, [pathname])

	useEffect(() => {
		let timer
		if (alertIsOpen) {
			timer = setTimeout(() => {
				dispatch(closeAlert())
			}, 3000)
		}
		return () => clearTimeout(timer)
	}, [alertIsOpen, dispatch])

	return (
		<div className='flex flex-row min-h-screen'>
			{isChecked ? (
				isAuth ? (
					<>
						<div
							className={`lg:block fixed z-50 duration-300 ${menuOpen ? 'block' : 'lg:opacity-100 opacity-0 lg:left-0 -left-[290px]'}`}
						>
							<Sidebar />
						</div>

						<div className='min-h-full flex flex-col sm:py-4 py-1 sm:px-8 px-4 lg:w-[calc(100%-290px)] mr-0 ml-auto w-full'>
							<Alert
								isOpen={alertIsOpen}
								{...alertProps}
							/>
							<div className='flex flex-row w-full justify-end items-center'>
								<Header />
								<div className='block lg:hidden mini:ml-2'>
									<button
										className='m-2 mr-0 transition text-gray-600'
										onClick={() => setMenuOpen(!menuOpen)}
									>
										{menuOpen ? (
											<svg
												xmlns='http://www.w3.org/2000/svg'
												className='w-6 h-6'
												fill='none'
												viewBox='0 0 24 24'
												stroke='currentColor'
												strokeWidth={1.5}
											>
												<path
													strokeLinecap='round'
													strokeLinejoin='round'
													d='M6 18L18 6M6 6l12 12'
												/>
											</svg>
										) : (
											<svg
												xmlns='http://www.w3.org/2000/svg'
												fill='none'
												viewBox='0 0 24 24'
												strokeWidth={1.5}
												stroke='currentColor'
												className='w-6 h-6'
											>
												<path
													strokeLinecap='round'
													strokeLinejoin='round'
													d='M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5'
												/>
											</svg>
										)}
									</button>
								</div>
							</div>

							<Breadcrumbs />
							<TooltipProvider>
								{children}
							</TooltipProvider>
							{isOpen && (
								<Modal
									isOpen={isOpen}
									{...modalProps}
								/>
							)}
						</div>
					</>
				) : (
					<></>
				)
			) : (
				''
			)}
		</div>
	)
}
