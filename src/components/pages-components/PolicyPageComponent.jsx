'use client'

import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import { BASE_SERVER_URL } from '@/utils/constants'

import { getRules } from '@/api/rules/get_rules'

import { getTranslation } from '@/i18n/client'

export default function PolicyPageComponent() {
	const { locale } = useParams()
	const { t } = getTranslation(locale)
	const [rules, setRules] = useState({})
	const [parser, setParser] = useState()

	let _isEng = locale === 'en'

	useEffect(() => {
		if (typeof document !== 'undefined') {
			setParser(new DOMParser())
		}
		fetchRules()
	}, [])

	const fetchRules = async () => {
		const result = await getRules()
		if (result.success) {
			setRules(result.data)
		}
	}

	return (
		<div className='flex flex-col'>
			<h1 className='sm:text-2xl text-xl font-semibold'>
				{t('rules_service')}
			</h1>
			{!!rules[_isEng ? 'contentEng' : 'contentRu']?.length &&
				rules[_isEng ? 'contentEng' : 'contentRu'] !== '<p></p>' && (
					<div className='w-full bg-white md:pl-16 px-4 md:pr-32 md:pb-8 pb-4 md:mt-6 mt-2'>
						<div
							className='tiptap sm:mt-8 mt-4'
							dangerouslySetInnerHTML={{
								__html: parser?.parseFromString(
									rules[_isEng ? 'contentEng' : 'contentRu'] || '',
									'text/html'
								).body.innerHTML
							}}
						></div>
					</div>
				)}
			{!!rules.files?.length && (
				<div
					id='files-section'
					className='mt-8 flex flex-col'
				>
					<label className='font-medium min-h-fit mb-2'>
						{`${t('files')}`}
					</label>
					<ul className={`mt-1 flex flex-col space-y-2`}>
						{rules.files.map(file => (
							<li key={file.id}>
								<a
									className='flex flex-row text-blue-700 hover:underline duration-300 cursor-pointer'
									href={`${BASE_SERVER_URL}${file?.path}`}
									download={true}
									target='_blank'
								>
									{file?.fileName}
								</a>
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	)
}
