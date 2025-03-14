import acceptLanguage from 'accept-language'
import { NextResponse } from 'next/server'

import { cookieName, fallbackLng, languages } from './i18n/settings'

acceptLanguage.languages(languages)

export const config = {
	matcher: [
		'/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js|site.webmanifest).*)'
	]
}

export function middleware(req) {
	let lng
	if (req.cookies.has(cookieName))
		lng = acceptLanguage.get(req.cookies.get(cookieName).value)
	if (!lng) lng = acceptLanguage.get(req.headers.get('Accept-Language'))
	if (!lng) lng = fallbackLng

	// Проверяем, является ли запрашиваемый путь изображением
	const isImageRequest = /\.(png|jpg|jpeg|gif|svg)$/.test(req.nextUrl.pathname)

	if (
		!languages.some(loc => req.nextUrl.pathname.startsWith(`/${loc}`)) &&
		!req.nextUrl.pathname.startsWith('/_next') &&
		!isImageRequest
	) {
		return NextResponse.redirect(
			new URL(`/${lng}${req.nextUrl.pathname}`, req.url)
		)
	}

	if (req.headers.has('referer')) {
		const refererUrl = new URL(req.headers.get('referer'))
		const lngInReferer = languages.find(l =>
			refererUrl.pathname.startsWith(`/${l}`)
		)
		const response = NextResponse.next()
		if (lngInReferer) response.cookies.set(cookieName, lngInReferer)
		return response
	}

	return NextResponse.next()
}
