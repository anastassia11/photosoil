import { languages } from '@/i18n/settings'

export async function generateStaticParams() {
    return languages.map((lng) => ({ lng }))
}

export default function TranslationsLayout({ params: { locale }, children }) {
    return <>{children}</>
}
