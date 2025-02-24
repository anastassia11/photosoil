'use client'

import i18next from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import resourcesToBackend from 'i18next-resources-to-backend'
import { useEffect, useState } from 'react'
import { useCookies as getCookies } from 'react-cookie'
import {
	useTranslation as getTranslationOrg,
	initReactI18next
} from 'react-i18next'

import { cookieName, getOptions, languages } from './settings'

const runsOnServerSide = typeof window === 'undefined'

i18next
	.use(initReactI18next)
	.use(LanguageDetector)
	.use(
		resourcesToBackend(
			(language, namespace) => import(`./locales/${language}/${namespace}.json`)
		)
	)
	.init({
		...getOptions(),
		lng: undefined, // let detect the language on client side
		detection: {
			order: ['path', 'htmlTag', 'cookie', 'navigator']
		},
		preload: runsOnServerSide ? languages : []
	})

export function getTranslation(lng, ns, options) {
	const [cookies, setCookie] = getCookies([cookieName])
	const ret = getTranslationOrg(ns, options)
	const { i18n } = ret
	if (runsOnServerSide && lng && i18n.resolvedLanguage !== lng) {
		i18n.changeLanguage(lng)
	} else {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		const [activeLng, setActiveLng] = useState(i18n.resolvedLanguage)
		// eslint-disable-next-line react-hooks/rules-of-hooks
		useEffect(() => {
			if (activeLng === i18n.resolvedLanguage) return
			setActiveLng(i18n.resolvedLanguage)
		}, [activeLng, i18n.resolvedLanguage])
		// eslint-disable-next-line react-hooks/rules-of-hooks
		useEffect(() => {
			if (!lng || i18n.resolvedLanguage === lng) return
			i18n.changeLanguage(lng)
		}, [lng, i18n])
		// eslint-disable-next-line react-hooks/rules-of-hooks
		useEffect(() => {
			if (cookies.i18next === lng) return
			setCookie(cookieName, lng, { path: '/' })
		}, [lng, cookies.i18next])
	}
	return ret
}
