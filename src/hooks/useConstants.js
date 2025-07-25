import { useParams } from 'next/navigation'

import { getTranslation } from '@/i18n/client'

export const useConstants = () => {
	const { locale } = useParams()
	const { t } = getTranslation(locale)

	const AUTHOR_INFO = [
		{ name: 'name', title: t('full_name') },
		{ name: 'organization', title: t('organization') },
		{ name: 'position', title: t('post') },
		{ name: 'specialization', title: t('specialization') },
		{ name: 'degree', title: t('degree') },
		{ name: 'contacts', title: t('contacts'), isArray: true },
		{ name: 'otherProfiles', title: t('otherProfiles'), isArray: true },
		{ name: 'description', title: t('author_about') }
	]

	const SOIL_INFO = [
		{ name: 'objectType', title: t('objectType') },
		{ name: 'geographicLocation', title: t('geographicLocation') },
		{ name: 'reliefLocation', title: t('reliefLocation') },
		{ name: 'plantCommunity', title: t('plantCommunity') },
		{ name: 'soilFeatures', title: t('soilFeatures') },
		{ name: 'comments', title: t('comments') }
	]

	const ECOSYSTEM_INFO = [
		{ name: 'description', title: t('features') },
		{ name: 'comments', title: t('comments') }
	]

	const PUBLICATION_INFO = [
		{ name: 'name', title: t('title') },
		{ name: 'authors', title: t('authors') },
		{ name: 'edition', title: t('info_journal') },
		{ name: 'type', title: t('publ_type') },
		{ name: 'doi', title: 'DOI' },
		{ name: 'description', title: t('annotation') },
		{ name: 'comments', title: t('comments') }
	]

	const NEWS_INFO = [
		{ name: 'title', title: t('heading') },
		{ name: 'annotation', title: t('annotation') },
		{ name: 'content', title: t('news_text') }
	]

	const MODERATOR_INFO = [
		{ name: 'name', title: t('fio') },
		{ name: 'email', title: 'Email' }
	]

	const RANK_ENUM = {
		0: t('main_editor'),
		1: t('executive_editor'),
		2: t('editor'),
		3: t('author')
	}

	const SOIL_ENUM = {
		0: t('dynamics'),
		1: t('profiles'),
		2: t('morphological')
	}

	const SOIL_ENUM2 = {
		0: {
			ru: 'Динамика почв',
			en: 'Soil dynamics'
		},
		1: {
			ru: 'Почвенные профили',
			en: 'Soil profiles'
		},
		2: {
			ru: 'Почвенные морфологические элементы',
			en: 'Soil morphons'
		},
	}

	const TRANSLATION_ENUM = {
		0: t('any_lang'),
		1: t('only_en'),
		2: t('only_ru')
	}

	const PUBLICATION_ENUM = {
		0: t('thesis'),
		1: t('article'),
		3: t('monographs'),
		4: t('other')
	}

	return {
		AUTHOR_INFO,
		SOIL_INFO,
		ECOSYSTEM_INFO,
		PUBLICATION_INFO,
		NEWS_INFO,
		MODERATOR_INFO,
		SOIL_ENUM,
		SOIL_ENUM2,
		RANK_ENUM,
		TRANSLATION_ENUM,
		PUBLICATION_ENUM
	}
}
