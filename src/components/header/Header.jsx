'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { setDropdown } from '@/store/slices/generalSlice'

import LanguageChanger from './LanguageChanger'
import Logo from './Logo'
import { getTranslation } from '@/i18n/client'

export default function Header({ locale }) {
	const dispatch = useDispatch()
	const pathname = usePathname()
	const dropdown = useSelector(state => state.general.dropdown)
	const [prevScrollPos, setPrevScrollPos] = useState(0)
	const [visible, setVisible] = useState(true)
	const { t } = getTranslation(locale)
	const [menuOpen, setMenuOpen] = useState(false)
	const [token, setToken] = useState(null)
	const [isLoading, setIsLoading] = useState(true)

	const soilsNavs = [
		{ key: 'soils', title: t('search_all') },
		{ key: 'profiles', title: t('profiles') },
		{ key: 'morphological', title: t('morphological') },
		{ key: 'dynamics', title: t('dynamics') }
	]

	const navigation = [
		{ key: '', title: t('main'), isDropdown: false },
		{ key: 'about', title: t('about'), isDropdown: false },
		{ key: 'soils', title: t('soils'), isDropdown: true, navs: soilsNavs },
		{ key: 'ecosystems', title: t('ecosystems'), isDropdown: false },
		{ key: 'publications', title: t('publications'), isDropdown: false },
		{ key: 'authors', title: t('authors'), isDropdown: false },
		{ key: 'news', title: t('news'), isDropdown: false }
	]

	useEffect(() => {
		localStorage.getItem('tokenData') &&
			setToken(JSON.parse(localStorage.getItem('tokenData'))?.token)
		setIsLoading(false)
	}, [])

	useEffect(() => {
		setMenuOpen(false)
	}, [pathname])

	const handleScroll = useCallback(() => {
		const currentScrollPos = window.scrollY
		setVisible(currentScrollPos > 0 ? prevScrollPos > currentScrollPos : true)
		setPrevScrollPos(currentScrollPos)
	}, [prevScrollPos, setVisible, setPrevScrollPos])

	useEffect(() => {
		window.addEventListener('scroll', handleScroll)
		return () => {
			window.removeEventListener('scroll', handleScroll)
		}
	}, [handleScroll])

	const handleClick = () => {
		setMenuOpen(false)
	}

	return (
		<header
			className={`fixed top-0 z-50 transition-all duration-200 
            ease-in-out px-4 2xl:px-8 w-full border-b shadow-sm h-16  bg-white/90 flex flex-row items-center justify-between`}
		>
			<div className='flex-1 '>
				<Logo locale={locale} />
			</div>

			<ul className='hidden xl:flex flex-row items-center space-x-5 xl:space-x-7 2xl:space-x-8'>
				{navigation.map(({ key, title, isDropdown, navs }) => (
					<li key={key}>
						{isDropdown ? (
							<>
								<button
									className={` ${key} w-full flex items-center justify-between gap-1  hover:text-blue-600`}
									onClick={() =>
										dispatch(
											setDropdown({
												key: key,
												isActive:
													dropdown.key !== null && dropdown.key !== key
														? true
														: !dropdown.isActive
											})
										)
									}
								>
									{title}
									<span
										className={`transition ${dropdown.key == key && dropdown.isActive ? '-rotate-180' : ''} `}
									>
										<svg
											xmlns='http://www.w3.org/2000/svg'
											fill='none'
											viewBox='0 0 24 24'
											strokeWidth='1.5'
											stroke='currentColor'
											className='h-4 w-4'
										>
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												d='M19.5 8.25l-7.5 7.5-7.5-7.5'
											/>
										</svg>
									</span>
								</button>
							</>
						) : (
							<Link
								href={`/${locale}/${key}`}
								prefetch={false}
								className='duration-300 cursor-pointer hover:text-blue-600'
							>
								{title}
							</Link>
						)}

						<div
							className={`${isDropdown && dropdown.key == key && dropdown.isActive ? 'visible translate-y-4' : 'invisible opacity-0'}
                            overflow-hidden w-[400px] absolute border shadow-md bg-white rounded-md transition-all duration-200`}
						>
							<ul className='py-2'>
								{navs?.map(({ key: navKey, title }) => (
									<li
										key={navKey}
										className='duration-300 cursor-pointer hover:text-blue-600 h-9 hover:bg-zinc-100 flex items-center xl:px-4 px-2'
									>
										<Link
											onClick={() => {
												dispatch(setDropdown({ isActive: false, key: null }))
												setMenuOpen(false)
											}}
											href={`/${locale}/${navKey}`}
											prefetch={false}
										>
											{title}
										</Link>
									</li>
								))}
							</ul>
						</div>
					</li>
				))}
			</ul>

			{!isLoading ? (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.5 }}
					className='flex-1 justify-end space-x-0 2xl:space-x-2 h-full flex flex-row items-center w-fit'
				>
					{!token ? (
						<Link
							href={`/${locale}/join`}
							prefetch={false}
							className='hidden sm:flex max-h-[40px] xl:px-4 px-2 py-2 font-medium text-center text-white transition-colors duration-300 
                transform bg-blue-600 rounded-lg hover:bg-blue-500 focus:outline-none active:bg-blue-600'
						>
							{t('join')}
						</Link>
					) : (
						<Link
							href={`/${locale}/admin`}
							prefetch={false}
							className='min-w-fit hidden sm:flex max-h-[40px] px-4 py-2 font-medium text-center text-blue-600 transition-colors duration-300 
                transform '
						>
							{t('dashboard')}
						</Link>
					)}
					<div className='w-[80px] h-full flex items-center'>
						<LanguageChanger locale={locale} />
					</div>
				</motion.div>
			) : (
				<div className='flex-1 justify-end xl:space-x-4 space-x-2 h-full flex flex-row items-center w-fit'></div>
			)}

			<div className='block xl:hidden ml-2'>
				<button
					className='m-2 mr-0 transition text-gray-600'
					onClick={() => setMenuOpen(!menuOpen)}
				>
					{menuOpen ? (
						<svg
							xmlns='http://www.w3.org/2000/svg'
							className='h-6 w-6'
							viewBox='0 0 20 20'
							fill='currentColor'
						>
							<path
								fillRule='evenodd'
								d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
								clipRule='evenodd'
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
			<div
				className={`bg-white xl:block px-3 sm:w-[400px] w-full self-end h-[calc(100vh-64px)] fixed top-[64px] flex 
            flex-col p-4
                duration-300 ${menuOpen ? 'block right-0' : 'opacity-0 -right-[100%]'}`}
			>
				<li className='mb-4 h-fit flex-col space-y-2 justify-end flex sm:hidden w-full px-2'>
					{!token ? (
						<Link
							href={`/${locale}/join`}
							prefetch={false}
							className='max-h-[40px] px-4 py-2 font-medium text-center text-white transition-colors duration-300 
                transform bg-blue-600 rounded-lg hover:bg-blue-500 focus:outline-none active:bg-blue-600'
						>
							{t('join')}
						</Link>
					) : (
						<Link
							href={`/${locale}/admin`}
							prefetch={false}
							className='min-w-fit max-h-[40px] px-2 py-2 font-medium text-left text-blue-600 transition-colors duration-300 
                transform '
						>
							{t('dashboard')}
						</Link>
					)}
				</li>
				<ul className='flex flex-col space-y-2'>
					{navigation.map(({ key, title, isDropdown, navs }) => (
						<li key={key}>
							{isDropdown ? (
								<>
									<button
										className={` ${key} px-4 w-full flex items-center justify-between gap-1  hover:text-blue-600`}
										onClick={() =>
											dispatch(
												setDropdown({
													key: key,
													isActive:
														dropdown.key !== null && dropdown.key !== key
															? true
															: !dropdown.isActive
												})
											)
										}
									>
										{title}
										<span
											className={`transition ${dropdown.key == key && dropdown.isActive ? '-rotate-180' : ''} `}
										>
											<svg
												xmlns='http://www.w3.org/2000/svg'
												fill='none'
												viewBox='0 0 24 24'
												strokeWidth='1.5'
												stroke='currentColor'
												className='h-4 w-4'
											>
												<path
													strokeLinecap='round'
													strokeLinejoin='round'
													d='M19.5 8.25l-7.5 7.5-7.5-7.5'
												/>
											</svg>
										</span>
									</button>
								</>
							) : (
								<Link
									onClick={handleClick}
									href={`/${locale}/${key}`}
									prefetch={false}
									className='px-4 duration-300 cursor-pointer hover:text-blue-600'
								>
									{title}
								</Link>
							)}
							{isDropdown && dropdown.key == key && dropdown.isActive ? (
								<div className='overflow-hidden'>
									<ul className='pt-1 pl-4'>
										{navs.map(({ key: navKey, title }) => (
											<li
												key={navKey}
												className='duration-300 cursor-pointer hover:text-blue-600 py-1 hover:bg-zinc-100 flex items-center px-4'
											>
												<Link
													onClick={handleClick}
													href={`/${locale}/${navKey}`}
													prefetch={false}
												>
													{title}
												</Link>
											</li>
										))}
									</ul>
								</div>
							) : (
								''
							)}
						</li>
					))}
				</ul>
			</div>
		</header>
	)
}
