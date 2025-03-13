import { Root, List, Trigger } from '@radix-ui/react-tabs'
import { useParams } from 'next/navigation'
import { memo, useEffect } from 'react'

import { getTranslation } from '@/i18n/client'

function LangTabs({
	onLangChange,
	onTwoLangChange,
	isEng,
	oldIsEng,
	createTwoLang,
	oldTwoLang,
	isEdit
}) {
	const { locale } = useParams()
	const { t } = getTranslation(locale)

	return (
		<Root
			defaultValue={false}
			className='pt-2 md:col-span-2 sticky top-0 z-40  bg-[#f6f7f9]'
			value={isEng}
			onValueChange={onLangChange}
		>
			<List className='w-full border-b flex md:items-center gap-x-4 overflow-x-auto justify-between md:flex-row flex-col'>
				<div className='flex items-center gap-x-4 overflow-x-auto md:order-1 order-2'>
					<Trigger
						disabled={!createTwoLang && isEng}
						className='disabled:text-gray-400 group outline-none border-b-2 border-[#f6f7f9] data-[state=active]:border-blue-600 data-[state=active]:text-blue-600'
						value={false}
					>
						<div className='pb-2.5 px-2 group-disabled:text-current duration-150 group-hover:text-blue-600 font-medium'>
							Русскоязычная версия
						</div>
					</Trigger>
					<Trigger
						disabled={!createTwoLang}
						className='disabled:text-gray-400 group outline-none border-b-2 border-[#f6f7f9] data-[state=active]:border-blue-600 data-[state=active]:text-blue-600'
						value={true}
					>
						<div className='pb-2.5 px-2 group-disabled:text-current duration-150 group-hover:text-blue-600 font-medium'>
							English version
						</div>
					</Trigger>
				</div>
				{(!oldTwoLang || !isEdit) && (
					<label
						htmlFor='createTwoLang'
						className={`md:order-2 order-1 pb-4 pr-1 md:pb-2.5 flex flex-row cursor-pointer items-center`}
					>
						<input
							type='checkbox'
							id='createTwoLang'
							checked={createTwoLang}
							onChange={onTwoLangChange}
							className='min-w-5 w-5 min-h-5 h-5 mr-2 rounded border-gray-300 '
						/>
						<span>
							{isEdit
								? `${oldIsEng ? t('add_ru') : t('add_en')}`
								: t('create_two_lang')}
						</span>
					</label>
				)}
			</List>
		</Root>
	)
}

export default memo(LangTabs)