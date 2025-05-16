'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { setDirty } from '@/store/slices/formSlice'

import { getTranslation } from '@/i18n/client'

export default function Sidebar() {
	const dispatch = useDispatch()
	const [role, setRole] = useState(null)
	const { locale } = useParams()
	const { t } = getTranslation(locale)
	const { isDirty } = useSelector(state => state.form)
	const router = useRouter()

	useEffect(() => {
		localStorage.getItem('tokenData') &&
			setRole(JSON.parse(localStorage.getItem('tokenData')).role)
	}, [])

	const content = [
		{
			url: 'objects',
			title: t('soils'),
			svg: (
				<svg
					xmlns='http://www.w3.org/2000/svg'
					fill='none'
					viewBox='0 0 24 24'
					strokeWidth='1.5'
					stroke='currentColor'
					className='w-5 h-5 -translate-y-[1px]'
				>
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						d='M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z'
					/>
				</svg>
			)
		},
		{
			url: 'ecosystems',
			title: t('ecosystems'),
			svg: (
				<svg
					stroke='none'
					fill='currentColor'
					className='w-5 h-5'
					strokeWidth='0.1'
					viewBox='0 0 16 16'
					xmlns='http://www.w3.org/2000/svg'
				>
					<path d='M11 8a2.64 2.64 0 0 0-.53-1.59l1.33-1.32a2.22 2.22 0 0 0 .82.17 1.94 1.94 0 0 0 2-1.88 2 2 0 0 0-4 0 1.76 1.76 0 0 0 .24.88L9.53 5.59A3.14 3.14 0 0 0 8 5.19a3 3 0 0 0-2.93 2.19h-.69A2 2 0 0 0 2.5 6.13 1.94 1.94 0 0 0 .5 8a1.94 1.94 0 0 0 2 1.88 2 2 0 0 0 1.88-1.25h.69A3 3 0 0 0 8 10.82 2.91 2.91 0 0 0 11 8zm1.62-5.24a.69.69 0 0 1 .75.62.76.76 0 0 1-1.5 0 .7.7 0 0 1 .75-.62zM2.5 8.63A.7.7 0 0 1 1.75 8a.7.7 0 0 1 .75-.62.7.7 0 0 1 .75.62.7.7 0 0 1-.75.63zm5.5.94A1.67 1.67 0 0 1 6.25 8 1.66 1.66 0 0 1 8 6.44 1.67 1.67 0 0 1 9.75 8 1.68 1.68 0 0 1 8 9.57z' />
					<path d='M2.5 4.38a2 2 0 0 0 .82-.17L5.08 6A3.73 3.73 0 0 1 6 5.13L4.26 3.38a1.76 1.76 0 0 0 .24-.88 1.94 1.94 0 0 0-2-1.87 1.94 1.94 0 0 0-2 1.87 1.94 1.94 0 0 0 2 1.88zm0-2.5a.7.7 0 0 1 .75.62.7.7 0 0 1-.75.63.7.7 0 0 1-.75-.63.7.7 0 0 1 .75-.62zm11 9.75a2 2 0 0 0-.82.17L10.92 10a3.73 3.73 0 0 1-.93.84l1.74 1.74a1.75 1.75 0 0 0-.23.88 2 2 0 0 0 4 0 1.94 1.94 0 0 0-2-1.83zm0 2.5a.7.7 0 0 1-.75-.63.76.76 0 0 1 1.5 0 .7.7 0 0 1-.75.63z' />
				</svg>
			)
		},
		{
			url: 'publications',
			title: t('publications'),
			svg: (
				<svg
					xmlns='http://www.w3.org/2000/svg'
					fill='none'
					viewBox='0 0 24 24'
					strokeWidth='1.5'
					stroke='currentColor'
					className='w-5 h-5 -translate-y-[1px]'
				>
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						d='M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z'
					/>
				</svg>
			)
		},
		{
			url: 'authors',
			title: t('authors'),
			svg: (
				<svg
					className='w-5 h-5'
					viewBox='0 0 24 24'
					fill='none'
					xmlns='http://www.w3.org/2000/svg'
				>
					<path
						d='M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z'
						stroke='currentColor'
						strokeWidth='2'
						strokeLinecap='round'
						strokeLinejoin='round'
					/>
					<path
						d='M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z'
						stroke='currentColor'
						strokeWidth='2'
						strokeLinecap='round'
						strokeLinejoin='round'
					/>
				</svg>
			)
		},
		{
			url: 'news',
			title: t('news'),
			svg: (
				<svg
					stroke='none'
					fill='currentColor'
					className='w-5 h-5 -translate-y-[2px]'
					strokeWidth='0.1'
					viewBox='0 0 24 24'
					xmlns='http://www.w3.org/2000/svg'
				>
					<path
						fillRule='evenodd'
						clipRule='evenodd'
						d='M21.1213 2.70705C19.9497 1.53548 18.0503 1.53547 16.8787 2.70705L15.1989 4.38685L7.29289 12.2928C7.16473 12.421 7.07382 12.5816 7.02986 12.7574L6.02986 16.7574C5.94466 17.0982 6.04451 17.4587 6.29289 17.707C6.54127 17.9554 6.90176 18.0553 7.24254 17.9701L11.2425 16.9701C11.4184 16.9261 11.5789 16.8352 11.7071 16.707L19.5556 8.85857L21.2929 7.12126C22.4645 5.94969 22.4645 4.05019 21.2929 2.87862L21.1213 2.70705ZM18.2929 4.12126C18.6834 3.73074 19.3166 3.73074 19.7071 4.12126L19.8787 4.29283C20.2692 4.68336 20.2692 5.31653 19.8787 5.70705L18.8622 6.72357L17.3068 5.10738L18.2929 4.12126ZM15.8923 6.52185L17.4477 8.13804L10.4888 15.097L8.37437 15.6256L8.90296 13.5112L15.8923 6.52185ZM4 7.99994C4 7.44766 4.44772 6.99994 5 6.99994H10C10.5523 6.99994 11 6.55223 11 5.99994C11 5.44766 10.5523 4.99994 10 4.99994H5C3.34315 4.99994 2 6.34309 2 7.99994V18.9999C2 20.6568 3.34315 21.9999 5 21.9999H16C17.6569 21.9999 19 20.6568 19 18.9999V13.9999C19 13.4477 18.5523 12.9999 18 12.9999C17.4477 12.9999 17 13.4477 17 13.9999V18.9999C17 19.5522 16.5523 19.9999 16 19.9999H5C4.44772 19.9999 4 19.5522 4 18.9999V7.99994Z'
					/>
				</svg>
			)
		}
	]

	const taxonomy = [
		{
			url: 'dictionary',
			title: t('dictionaries'),
			svg: (
				<svg
					xmlns='http://www.w3.org/2000/svg'
					fill='none'
					viewBox='0 0 24 24'
					strokeWidth={1.5}
					stroke='currentColor'
					className='w-5 h-5 -translate-y-[1px]'
				>
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						d='M6 6.878V6a2.25 2.25 0 012.25-2.25h7.5A2.25 2.25 0 0118 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 004.5 9v.878m13.5-3A2.25 2.25 0 0119.5 9v.878m0 0a2.246 2.246 0 00-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0121 12v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6c0-.98.626-1.813 1.5-2.122'
					/>
				</svg>
			)
		}
	]

	const policy = [
		{
			url: 'policy',
			title: t('rules'),
			svg: (
				<svg
					fill='currentColor'
					viewBox='0 0 32 32'
					xmlns='http://www.w3.org/2000/svg'
					className='w-6 h-6 -translate-x-[2px]'
				>
					<g
						id='SVGRepo_bgCarrier'
						strokeWidth='0'
					></g>
					<g
						id='SVGRepo_tracerCarrier'
						strokeLinecap='round'
						strokeLinejoin='round'
					></g>
					<g id='SVGRepo_iconCarrier'>
						{' '}
						<title></title>{' '}
						<g id='Layer_12'>
							{' '}
							<path d='M25.41,7.09l-9-4a1,1,0,0,0-.82,0l-9,4A1,1,0,0,0,6,8v8.56A8.69,8.69,0,0,0,8.91,23l6.43,5.71a1,1,0,0,0,1.32,0L23.09,23A8.69,8.69,0,0,0,26,16.56V8A1,1,0,0,0,25.41,7.09ZM24,16.56a6.67,6.67,0,0,1-2.24,5L16,26.66l-5.76-5.12a6.67,6.67,0,0,1-2.24-5V8.65l8-3.56,8,3.56Z'></path>{' '}
							<path d='M13,14.29a1,1,0,0,0-1.42,1.42l2.5,2.5a1,1,0,0,0,1.42,0l5-5A1,1,0,0,0,19,11.79l-4.29,4.3Z'></path>{' '}
						</g>{' '}
					</g>
				</svg>
			)
		}
	]

	const users = [
		{
			url: 'users',
			title: t('users'),
			svg: (
				<svg
					xmlns='http://www.w3.org/2000/svg'
					fill='none'
					viewBox='0 0 24 24'
					strokeWidth='1.5'
					stroke='currentColor'
					className='w-5 h-5'
				>
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						d='M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z'
					/>
				</svg>
			)
		}
	]

	const handleLinkClick = (e, href) => {
		if (isDirty) {
			e.preventDefault() // Отменяем переход по умолчанию
			const confirmLeave = window.confirm(t('form_confirm'))
			if (confirmLeave) {
				dispatch(setDirty(false))
				router.push(href) // Переход к новому URL
			}
		}
	}

	const LinkItem = ({ url, title, svg }) => (
		<Link
			href={`/${locale}/admin/${url}`}
			prefetch={false}
			onClick={e => handleLinkClick(e, `/${locale}/admin/${url}`)}
			className='cursor-pointer flex items-center px-3 py-2 transition-colors duration-300 
            transform rounded-lg hover:bg-gray-100 hover:text-gray-700'
		>
			{svg && <div className='text-zinc-500'>{svg}</div>}
			<span
				className={`${url !== 'policy' ? 'ml-2' : 'ml-1'} mr-2 font-medium`}
			>
				{title}
			</span>
		</Link>
	)

	return (
		<aside
			className='backface flex flex-col sm:min-w-[290px] min-w-[270px] h-screen sm:px-6 px-4 overflow-y-auto bg-white 
        border-r border-l rtl:border-r-0 rtl:border-l'
		>
			<Link
				prefetch={false}
				href={`/${locale}`}
				className='hover:cursor-pointer border-b flex flex-row items-center sm:h-[70px] h-[60px] min-h-[60px]'
			>
				<Image
					src={'/logo.png'}
					width={300}
					height={300}
					alt='logo'
					className='sm:w-9 w-6'
				/>
				<p className='text-zinc-600 ml-2 sm:text-3xl text-xl font-semibold'>
					Photo<span className='pl-[2px] text-[#226eaf] font-bold'>SOIL</span>
				</p>
			</Link>

			<div className='flex flex-col justify-between flex-1 sm:mt-6 mt-4'>
				<nav className='-mx-3 sm:space-y-6 space-y-4'>
					<ul className='sm:space-y-3 space-y-2'>
						<label className='w-full px-3 text-sm text-gray-500 uppercase'>
							{t('content')}
						</label>
						{content.map(item => (
							<li key={`sidebar_${item.url}`}>
								<LinkItem {...item} />
							</li>
						))}
					</ul>

					{role === 'Admin' && (
						<>
							<ul className='space-y-3 '>
								<label className='w-full px-3 text-sm text-gray-500 uppercase'>
									{t('taxonomy')}
								</label>
								{taxonomy.map(item => (
									<li key={`sidebar_${item.url}`}>
										<LinkItem {...item} />
									</li>
								))}
							</ul>

							<ul className='space-y-3 '>
								<label className='w-full px-3 text-sm text-gray-500 uppercase'>
									{t('policy')}
								</label>
								{policy.map(item => (
									<li key={`sidebar_${item.url}`}>
										<LinkItem {...item} />
									</li>
								))}
							</ul>

							<ul className='space-y-3 '>
								<label className='w-full px-3 text-sm text-gray-500 uppercase'>
									{t('account_management')}
								</label>
								{users.map(item => (
									<li key={`sidebar_${item.url}`}>
										<LinkItem {...item} />
									</li>
								))}
							</ul>
						</>
					)}
				</nav>
			</div>
		</aside>
	)
}
