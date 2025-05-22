'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Oval } from 'react-loader-spinner'

import LanguageChanger from '../header/LanguageChanger'

import { getTranslation } from '@/i18n/client'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { ChevronDown, LogOut } from 'lucide-react'
import Link from 'next/link'

export default function Header() {
	const router = useRouter()
	const [isLoading, setIsLoading] = useState(false)
	const [email, setEmail] = useState(null)

	const [open, setOpen] = useState(null)
	const [role, setRole] = useState(null)
	const { locale } = useParams()
	const { t } = getTranslation(locale)

	useEffect(() => {
		localStorage.getItem('email') && setEmail(localStorage.getItem('email').split('@')[0])
		localStorage.getItem('tokenData') &&
			setRole(JSON.parse(localStorage.getItem('tokenData'))?.role)
	}, [])

	const handleLogOut = () => {
		setIsLoading(true)
		router.push('/login')
		localStorage.removeItem('tokenData')
	}

	return (
		<div className='relative w-fit self-end flex flex-row justify-center items-center'>
			<DropdownMenu open={open}
				onOpenChange={setOpen}>
				<DropdownMenuTrigger asChild
					className='group/dropdown'>
					<div
						className='relative w-fit self-end flex flex-row items-center
                mini:px-4 py-1 cursor-pointer'>
						<span className='mr-2 uppercase bg-blue-600 w-10 h-10 rounded-2xl text-white font-light text-2xl flex items-center justify-center'>
							{email?.[0]}
						</span>
						<div className='mr-2 flex flex-col justify-center items-start'>
							<p
								className='min-w-fit text-nowrap font-semibold group-hover/dropdown:text-blue-700 group-data-[state=open]/dropdown:text-blue-700 duration-300'
							>
								{email}
							</p>
							<p className='text-sm text-zinc-500'>
								{role === 'Admin' ? t('admin') : t('moderator')}
							</p>
						</div>
						<ChevronDown size={18} strokeWidth={1.5}
							className='transition group-data-[state=open]/dropdown:-rotate-180' />
					</div>
				</DropdownMenuTrigger>

				<DropdownMenuContent onCloseAutoFocus={e => e.preventDefault()}>
					<DropdownMenuItem className='text-base focus:text-blue-600 cursor-pointer'>
						<Link
							href={`/${locale}/admin/settings`}
							prefetch={false}
							onClick={() => setOpen(false)}
						>
							{t('user_preferences')}
						</Link>

					</DropdownMenuItem>
					<DropdownMenuItem className='text-base focus:text-blue-600 cursor-pointer'
						onClick={handleLogOut}
						disabled={isLoading}>
						{isLoading ? <Oval
							height={20}
							width={20}
							color='#71717a'
							visible={true}
							ariaLabel='oval-loading'
							secondaryColor='#71717a'
							strokeWidth={4}
							strokeWidthSecondary={4}
						/> :
							<LogOut />
						}
						<p>
							{t('logout')}
						</p>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<LanguageChanger
				isTransparent={true}
				locale={locale}
			/>
		</div >
	)
}
