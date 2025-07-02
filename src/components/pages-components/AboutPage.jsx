import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { getTranslation } from '@/i18n'
import { BASE_SERVER_URL } from '@/utils/constants'

export default async function AboutPageComponent({ locale }) {
	const { t } = await getTranslation(locale)

	const CustomLink = ({ children, href }) => <Link href={href}
		className='cursor-pointer text-blue-600 transition-all duration-300 hover:underline hover:text-blue-700'>
		{children}
	</Link>

	const data = {
		block1: {
			title: {
				ru: "Для чего нужна база даннных PhotoSOIL",
				en: "What is the PhotoSOIL database used for?"
			},
			description: [
				{
					ru: "Почвы обладают значительной морфологической изменчивостью даже в пределах одного почвенного типа. Однако многие «почвенные рисунки», создаваемые горизонтными и внегоризонтными почвенными морфологическими элементами, никак не учитываются при классификационной диагностике почв. Почвенные «рисунки» очень трудно охарактеризовать в морфологическом описании, поэтому проще всего их обсуждать, имея под руками качественные фотографии почв.",
					en: "Soils have high morphological variability in space. However, many soil patterns consisting of soil morphons are not considered at all when classifying soils. It is very difficult to characterise soil patterns in a morphological description, so it is easiest to discuss them using high-quality photographs of soils."
				},
				{
					ru: "Ограничением в применении цифровых технологий является недостаточное количество фотографий почв в интернете. Исследователи, как правило, располагают только собственными материалами, которые не доступны научному сообществу и имеют региональную специфику. Несмотря на то, что в последние годы увеличилось количество фотографий в научных публикациях и авторских Telegram-каналах, сохраняется потребность в систематизации и депонировании этих материалов. Для решения этой задачи и создана 4-я версия базы данных Photosoil.",
					en: "One limitation of applying digital technologies is the insufficient number of soil photographs available online. Researchers usually only have access to their own materials, which are not accessible to the wider scientific community and are often specific to a particular region. While the number of photographs in scientific publications and personal Telegram channels has increased in recent years, there is still a need to organise and archive these materials. The 4th version of the Photosoil database was created to address this issue."
				},
				{
					ru: <>Отличием её от прежних версий является то, что вход в базу осуществляется через <CustomLink href={`/${locale}`}>карту</CustomLink>, что и есть способ упорядочивания информации. Новизной является возможность фильтрации объектов с целью их дифференцированного отображения на карте. Также добавлены слои с <CustomLink href={`/${locale}/ecosystems`}>экосистемами</CustomLink> и <CustomLink href={`/${locale}/publications`}>публикациями</CustomLink>, что позволяет усилить контекстуализацию почвенных данных.</>,
					en: <>The key difference from previous versions is that access to the database is now <CustomLink href={`/${locale}`}>map-based</CustomLink>, providing an effective way to organise information. A new feature is the ability to filter objects for a differentiated display on the map. Layers showing <CustomLink href={`/${locale}/ecosystems`}>ecosystems</CustomLink> and <CustomLink href={`/${locale}/publications`}>publications</CustomLink> have also been added to enhance the contextualisation of soil data.</>
				}
			]
		},
		block2: {
			title: {
				ru: "О целях создания",
				en: "Purpose of the Database Development"
			},
			description: [
				{
					ru: "База данных PhotoSOIL призвана стать научной площадкой для исследователей, желающих делиться своими фотографиями почв с теми, кому они могут быть потенциально полезны. Миссия базы данных заключается в оказании содействия развитию сравнительных генетико-географических исследований. Она призвана расширить представления о морфологическом многообразии почв среди почвоведов и натуралистов.",
					en: "The PhotoSOIL database is intended as a scientific platform through which researchers can share their soil photographs with others who might benefit from them. Its mission is to promote comparative genetic and geographical research. It seeks to enhance the understanding of soil morphological diversity among soil scientists and naturalists."
				}
			]
		},
		block3: {
			title: {
				ru: "Содержание и наполнение",
				en: "Database Contents"
			},
			subTitle: {
				ru: "База данных состоит из трёх основных разделов",
				en: "The database consists of three main sections"
			},
			subData: [
				{
					title: {
						ru: "Почвенные профили",
						en: "Soil Profiles"
					},
					description: [
						{
							ru: "Здесь содержатся фотографии почв. Почвы привязаны к карте по месту заложения почвенного разреза. Приведены краткие описания факторов почвообразования, особенностей строения и генезиса почвы. При наличии приводятся дополнительные фотографии элементов строения почвы, её боковых стенок.",
							en: "Photographs of soil profile sections are posted here. Objects are linked to a map. Brief descriptions of soil formation factors, soil structure features and genesis are provided. Additional photographs of soil morphons are provided if available."
						},
					],
					link: 'profiles'
				},
				{
					title: {
						ru: "Почвенные морфологические элементы",
						en: "Soil morphons"
					},
					description: [
						{
							ru: "Эта категория наполняется фотографиями различных элементов строения почв, от очень малых, которые относятся к области микроморфологии, до имеющих размерность в первые метры. Эти фотографии аналогично первой категории сопровождены краткими описаниями, привязаны к почвенным классификациям и карте.",
							en: "This category is filled with photographs of various morphons and other structural elements, from very small ones, which are related to the field of micromorphology, to those with dimensions of a few meters. These photographs are linked to a map, accompanied by brief descriptions and assigned to soil classification taxa."
						},
					],
					link: 'morphological'
				},
				{
					title: {
						ru: "Динамика почв",
						en: "Soil Dynamics"
					},
					description: [
						{
							ru: "Категория создана для размещения фотографий, которые бы явным образом демонстрировали какие-либо быстрые трансформации почв, например, связанные с эрозионными процессами.",
							en: "This category is intended for posting photographs that clearly demonstrate rapid soil transformations, such as those associated with erosion processes."
						},
					],
					link: 'dynamics'
				},
			]
		},
		block4: {
			title: {
				ru: "Структуризация данных",
				en: "Data structuring"
			},
			description: [
				{
					ru: <>Для структуризации данных используются <CustomLink href='https://soils.narod.ru/'>Классификация и диагностика почв России</CustomLink>, и <CustomLink href={`${BASE_SERVER_URL}/Storage/wrb2014_2015_rus.pdf`}>Международная классификация почв «World reference base for soil resources» (WRB).</CustomLink></>,
					en: <><CustomLink href={`${BASE_SERVER_URL}/Storage/wrb2014_2015_rus.pdf`}>The International Soil Classification World Reference Base for Soil Resources (WRB)</CustomLink> is used for data structuring.</>
				}
			]
		}
	}

	return (
		<div className='flex flex-col sm:space-y-24 space-y-12 items-center w-full'>
			<div className='h-[600px] bg-zinc-400 w-full overflow-hidden flex items-center justify-center'>
				<div className='flex flex-col space-y-4 max-w-screen-xl mx-8 m-auto w-full h-full justify-center relative'>
					<h2 className='text-center lg:text-left z-10 sm:text-5xl text-4xl font-bold text-white'>
						{t('visual_database')} <br className='sm:block hidden'></br>
						<span className='text-blue-700'>{t('soils_ecosystems')}</span>
					</h2>
					<p className='text-center lg:text-left lg:w-[700px] pb-2 z-10 sm:text-xl text-lg text-gray-50 sm:font-semibold font-medium'>
						{t('tagline')}
					</p>
					<Image
						src='/map.png'
						alt='map'
						width={2000}
						height={2000}
						className='absolute sm:-top-2 top-8 sm:-right-[130px] lg:-right-[330px] scale-150 opacity-55 sm:scale-100 sm:object-scale-down'
					/>
					<Link
						href={`/${locale}/join`}
						prefetch={false}
						className='lg:w-[200px] w-full px-6 py-2 font-medium text-center text-white transition-colors duration-300 
                transform bg-blue-600 rounded-lg hover:bg-blue-500 focus:outline-none active:bg-blue-600'
					>
						{t('join')}
					</Link>
				</div>
			</div>

			<div className='max-w-screen-xl m-auto flex flex-col sm:space-y-24 space-y-12 sm:mx-8 mx-4'>
				<div>
					<h2 className='sm:text-2xl text-xl font-semibold text-center'>
						{data.block1.title[locale]}
					</h2>
					<div className='text-base mt-6 space-y-3'>
						{data.block1.description.map((desc, idx) =>
							<p key={`desc1-${idx}`}>
								{desc[locale]}
							</p>
						)}
					</div>
				</div>

				<div className='flex sm:flex-row flex-col bg-white p-6 px-8 rounded-2xl border'>
					<h2 className='sm:text-2xl text-xl font-semibold w-full sm:w-1/3 mb-4 sm:mb-0'>
						{data.block2.title[locale]}
					</h2>
					<div className='sm:w-2/3 w-full text-base'>
						{data.block2.description.map((desc, idx) =>
							<p key={`desc2-${idx}`}>
								{desc[locale]}
							</p>
						)}
					</div>
				</div>

				<div>
					<h2 className='sm:text-2xl text-xl font-semibold text-center'>
						{data.block3.title[locale]}
					</h2>
					<p className='text-base mt-2 text-center text-zinc-500'>
						{data.block3.subTitle[locale]}
					</p>

					<div className='flex lg:flex-row flex-col space-y-4 lg:space-y-0 lg:space-x-4 space-x-0 mt-8'>
						{data.block3.subData.map((data, idx) =>
							<div key={`subData-${idx}`} className='flex flex-col bg-white py-6 px-8 rounded-2xl lg:w-1/3 w-full space-y-4 border hover:border-blue-600 duration-300 cursor-default'>
								<h2 className='text-xl font-semibold text-blue-600'>
									{data.title[locale]}
								</h2>
								<div className='text-base'>
									{data.description.map((desc, idx) =>
										<p key={`subData-desc-${idx}`}>
											{desc[locale]}
										</p>
									)}
								</div>
								<Link
									href={`/${locale}/${data.link}`}
									className='flex items-center -mx-1 text-blue-600 transition-colors duration-300 transform  hover:underline hover:text-blue-700 '
								>
									<span className='mx-1'>{t('go_to_view')}</span>
									<svg
										className='w-4 h-4 mx-1 rtl:-scale-x-100'
										fill='currentColor'
										viewBox='0 0 20 20'
										xmlns='http://www.w3.org/2000/svg'
									>
										<path
											fillRule='evenodd'
											d='M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z'
											clipRule='evenodd'
										></path>
									</svg>
								</Link>
							</div>
						)}
					</div>
				</div>
				<div className='flex md:flex-row flex-col bg-white p-6 px-8 rounded-2xl border'>
					<h2 className='sm:text-2xl text-xl font-semibold md:w-1/3 w-full mb-4 md:mb-0'>
						{data.block4.title[locale]}
					</h2>

					<div className='md:w-2/3 w-full text-base'>
						{data.block4.description.map((desc, idx) =>
							<p key={`desc4-${idx}`}>
								{desc[locale]}
							</p>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}
