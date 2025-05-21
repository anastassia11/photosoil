import Image from 'next/image'
import Link from 'next/link'

import { getTranslation } from '@/i18n'

export default async function Footer({ locale }) {
	const { t } = await getTranslation(locale)

	return (
		<footer className='absolute bottom-0 border-t w-full mt-24 flex xl:flex-row flex-col xl:space-x-6 justify-between xl:items-start items-center px-8 py-6'>
			<div className='my-auto hidden xl:block'>
				<div className='flex-1 flex flex-row items-center'>
					<Image
						src={'/logo.png'}
						width={300}
						height={300}
						alt='logo'
						className='w-9'
					/>
					<p className='text-zinc-600 ml-2 text-3xl font-semibold'>
						Photo<span className='pl-[2px] text-[#226eaf] font-bold'>SOIL</span>
					</p>
				</div>
			</div>

			<div className='flex-1 flex flex-col sm:flex-row xl:justify-evenly justify-between w-full space-y-4 sm:space-y-0'>
				<span className='flex flex-col space-y-1 items-center sm:items-start'>
					<p className='text-lg text-blue-700'>{t('main_editor')}</p>
					<p>{t('kulizhsky')}</p>
					<a
						className='flex items-center gap-1.5'
						href='mailto:kulizhskiy@yandex.ru'
					>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							className='size-5 shrink-0 text-zinc-600'
							fill='none'
							viewBox='0 0 24 24'
							stroke='currentColor'
							strokeWidth='2'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
							/>
						</svg>
						<span>kulizhskiy@yandex.ru</span>
					</a>
				</span>
				<span className='flex flex-col space-y-1 items-center sm:items-start'>
					<p className='text-lg text-blue-700'>{t('executive_editor')}</p>
					<p>{t('loiko')}</p>
					<a
						className='flex items-center gap-1.5'
						href='mailto:s.loyko@yandex.ru'
					>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							className='size-5 shrink-0 text-zinc-600'
							fill='none'
							viewBox='0 0 24 24'
							stroke='currentColor'
							strokeWidth='2'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
							/>
						</svg>
						<span>s.loyko@yandex.ru</span>
					</a>
				</span>
				<div className='md:flex hidden xl:hidden flex-col sm:items-center md:items-end xl:mt-0 mt-4'>
					<p className='text-lg text-blue-700'>{t('social_media')}</p>
					<div className='flex flex-row items-center text-zinc-600 space-x-4'>
						<a
							className='flex items-center gap-1.5'
							href='https://t.me/Photosoil'
							target='_blank'
						>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								width={800}
								height={800}
								viewBox='0 0 32 32'
								className='w-7 h-7'
								fill='currentColor'
							>
								<path d='M16 .5C7.437.5.5 7.438.5 16S7.438 31.5 16 31.5c8.563 0 15.5-6.938 15.5-15.5S24.562.5 16 .5zm7.613 10.619-2.544 11.988c-.188.85-.694 1.056-1.4.656l-3.875-2.856-1.869 1.8c-.206.206-.381.381-.781.381l.275-3.944 7.181-6.488c.313-.275-.069-.431-.482-.156l-8.875 5.587-3.825-1.194c-.831-.262-.85-.831.175-1.231l14.944-5.763c.694-.25 1.3.169 1.075 1.219z' />
							</svg>
						</a>

						<a
							className='flex items-center gap-1.5'
							href='https://www.youtube.com/@photosoil'
							target='_blank'
						>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								width={800}
								height={800}
								fill='none'
								viewBox='0 0 48 48'
								className='w-8 h-8'
							>
								<circle
									cx={24}
									cy={24}
									r={20}
									fill='currentColor'
								/>
								<path
									fill='#fff'
									fillRule='evenodd'
									d='M35.3 16.378c.4.4.687.896.835 1.44.849 3.418.652 8.814.016 12.363a3.23 3.23 0 0 1-2.275 2.275C31.882 33 23.854 33 23.854 33s-8.027 0-10.022-.544a3.23 3.23 0 0 1-2.274-2.275c-.854-3.402-.62-8.802-.017-12.346a3.23 3.23 0 0 1 2.275-2.275c1.994-.543 10.022-.56 10.022-.56s8.027 0 10.022.544a3.23 3.23 0 0 1 1.44.834ZM27.942 24l-6.659 3.857v-7.714L27.943 24Z'
									clipRule='evenodd'
								/>
							</svg>
						</a>
					</div>
					<Link
						href={`/${locale}/policy`}
						prefetch={false}
					>
						{t('rules')}
					</Link>
				</div>
			</div>

			<div className='flex md:hidden xl:flex flex-col justify-between xl:items-end items-center xl:mt-0 mt-4'>
				<p className='text-lg text-blue-700'>{t('social_media')}</p>
				<div className='flex flex-row items-center text-zinc-600 space-x-4'>
					<a
						className='flex items-center gap-1.5'
						href='https://t.me/Photosoil'
						target='_blank'
					>
						<svg className='w-7 h-7' viewBox="0 0 256 256" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path d="M128,0 C57.307,0 0,57.307 0,128 L0,128 C0,198.693 57.307,256 128,256 L128,256 C198.693,256 256,198.693 256,128 L256,128 C256,57.307 198.693,0 128,0 L128,0 Z" fill="#40B3E0"> </path> <path d="M190.2826,73.6308 L167.4206,188.8978 C167.4206,188.8978 164.2236,196.8918 155.4306,193.0548 L102.6726,152.6068 L83.4886,143.3348 L51.1946,132.4628 C51.1946,132.4628 46.2386,130.7048 45.7586,126.8678 C45.2796,123.0308 51.3546,120.9528 51.3546,120.9528 L179.7306,70.5928 C179.7306,70.5928 190.2826,65.9568 190.2826,73.6308" fill="#FFFFFF"> </path> <path d="M98.6178,187.6035 C98.6178,187.6035 97.0778,187.4595 95.1588,181.3835 C93.2408,175.3085 83.4888,143.3345 83.4888,143.3345 L161.0258,94.0945 C161.0258,94.0945 165.5028,91.3765 165.3428,94.0945 C165.3428,94.0945 166.1418,94.5735 163.7438,96.8115 C161.3458,99.0505 102.8328,151.6475 102.8328,151.6475" fill="#D2E5F1"> </path> <path d="M122.9015,168.1154 L102.0335,187.1414 C102.0335,187.1414 100.4025,188.3794 98.6175,187.6034 L102.6135,152.2624" fill="#B5CFE4"> </path> </g> </g></svg>
					</a>

					<a
						className='flex items-center gap-1.5'
						href='https://www.youtube.com/@photosoil'
						target='_blank'
					>
						<svg className='w-7 h-7' viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <g fill="none" fillRule="evenodd"> <path d="M36,72 L36,72 C55.882251,72 72,55.882251 72,36 L72,36 C72,16.117749 55.882251,-3.65231026e-15 36,0 L36,0 C16.117749,3.65231026e-15 -2.4348735e-15,16.117749 0,36 L0,36 C2.4348735e-15,55.882251 16.117749,72 36,72 Z" fill="#FF0002"></path> <path d="M31.044,42.269916 L31.0425,28.6877416 L44.0115,35.5022437 L31.044,42.269916 Z M59.52,26.3341627 C59.52,26.3341627 59.0505,23.003199 57.612,21.5363665 C55.7865,19.610299 53.7405,19.6012352 52.803,19.4894477 C46.086,19 36.0105,19 36.0105,19 L35.9895,19 C35.9895,19 25.914,19 19.197,19.4894477 C18.258,19.6012352 16.2135,19.610299 14.3865,21.5363665 C12.948,23.003199 12.48,26.3341627 12.48,26.3341627 C12.48,26.3341627 12,30.2467232 12,34.1577731 L12,37.8256098 C12,41.7381703 12.48,45.6492202 12.48,45.6492202 C12.48,45.6492202 12.948,48.9801839 14.3865,50.4470165 C16.2135,52.3730839 18.612,52.3126583 19.68,52.5135736 C23.52,52.8851913 36,53 36,53 C36,53 46.086,52.9848936 52.803,52.4954459 C53.7405,52.3821478 55.7865,52.3730839 57.612,50.4470165 C59.0505,48.9801839 59.52,45.6492202 59.52,45.6492202 C59.52,45.6492202 60,41.7381703 60,37.8256098 L60,34.1577731 C60,30.2467232 59.52,26.3341627 59.52,26.3341627 L59.52,26.3341627 Z" fill="#FFF"></path> </g> </g></svg>
					</a>
				</div>
				<Link
					href={`/${locale}/policy`}
					prefetch={false}
				>
					{t('rules')}
				</Link>
			</div>
		</footer>
	)
}
