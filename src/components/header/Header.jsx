'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import LanguageChanger from './LanguageChanger'
import Logo from './Logo'
import { getTranslation } from '@/i18n/client'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { ChevronDown, Menu, X } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible'

export default function Header({ locale }) {
	const pathname = usePathname()
	const segment = pathname.split("/").pop()

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
		console.log(pathname)
		setMenuOpen(false)
	}, [pathname])

	const handleClick = () => {
		setMenuOpen(false)
	}

	return (
		<header
			className={`w-screen fixed top-0 z-50 transition-all duration-200 
            ease-in-out pl-4 pr-6 2xl:pl-8 2xl:pr-10 border-b shadow-sm h-16  bg-white/90 flex flex-row items-center justify-between`}
		>
			<div className='flex-1 '>
				<Logo locale={locale} />
			</div>

			<ul className='hidden xl:flex flex-row items-center space-x-5 xl:space-x-7 2xl:space-x-8'>
				{navigation.map(({ key, title, isDropdown, navs }) => (
					<li key={key}>
						{isDropdown ? (
							<>
								<DropdownMenu>
									<DropdownMenuTrigger asChild className='group/dropdown'>
										<button
											className={`w-full flex items-center justify-between gap-1 hover:text-blue-600
												${navs.map(({ key }) => key).some(str => str.includes(segment))
												&& 'data-[state=closed]:font-semibold data-[state=closed]:text-blue-600'}`}
										>
											{title}
											<ChevronDown size={18} strokeWidth={1.5} className='transition group-data-[state=open]/dropdown:-rotate-180' />
										</button>
									</DropdownMenuTrigger>
									<DropdownMenuContent onCloseAutoFocus={e => e.preventDefault()}>
										{navs?.map(({ key: navKey, title }) => (
											<DropdownMenuItem key={navKey.length ? navKey : 'main'} className={`text-base focus:text-blue-600 cursor-pointer
												${segment.includes(navKey)
												&& 'font-semibold text-blue-600'}`}
												onClick={() => window.location.href = `/${locale}/${navKey}`}>
												{title}
											</DropdownMenuItem>
										))}
									</DropdownMenuContent>
								</DropdownMenu>

							</>
						) : (
							<Link
								href={`/${locale}/${key}`}
								prefetch={false}
								className={`duration-300 cursor-pointer hover:text-blue-600
									${((!!key.length && segment.includes(key)) || (!key.length && (segment === 'ru' || segment === 'en')))
									&& 'font-semibold text-blue-600'}`}
							>
								{title}
							</Link>
						)}
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
					<div className='h-full flex items-center'>
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
						<X strokeWidth={1.5} />
					) : (
						<Menu strokeWidth={1.5} />
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
							className='min-w-fit max-h-[40px] py-2 font-medium text-left text-blue-600 transition-colors duration-300 
                transform '
						>
							{t('dashboard')}
						</Link>
					)}
				</li>
				<ul className='flex flex-col space-y-2 px-2'>
					{navigation.map(({ key, title, isDropdown, navs }) => (
						<li key={key} className='w-full'>
							{isDropdown ? (
								<>
									<Collapsible className='group/dropdown'>
										<CollapsibleTrigger asChild className='group/dropdown'>
											<button
												className={`duration-300 w-full flex items-center justify-between gap-1 hover:text-blue-600
													${navs.map(({ key }) => key).some(str => str.includes(segment))
													&& 'group-data-[state=closed]/dropdown:font-semibold group-data-[state=closed]/dropdown:text-blue-600'}`}
											>
												{title}
												<ChevronDown size={18} strokeWidth={1.5} className='transition group-data-[state=open]/dropdown:-rotate-180' />
											</button>
										</CollapsibleTrigger>
										<CollapsibleContent>
											<div className='overflow-hidden'>
												<ul className='pt-1 pl-2'>
													{navs.map(({ key: navKey, title }) => (
														<Link key={navKey}
															className={`duration-300 hover:text-blue-600 py-1 flex items-center px-4
																${segment.includes(navKey)
																&& 'font-semibold text-blue-600'}`}
															onClick={handleClick}
															href={`/${locale}/${navKey}`}
															prefetch={false}
														>
															{title}
														</Link>
													))}
												</ul>
											</div>
										</CollapsibleContent>
									</Collapsible>
								</>
							) : (
								<Link
									href={`/${locale}/${key}`}
									prefetch={false}
									className={`duration-300 cursor-pointer hover:text-blue-600 w-full flex
										${((!!key.length && segment.includes(key)) || (!key.length && (segment === 'ru' || segment === 'en')))
										&& 'font-semibold text-blue-600'}`}
								>
									{title}
								</Link>
							)}
						</li>
					))}
				</ul>
			</div>
		</header>
	)
}
