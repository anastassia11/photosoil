import AboutPageComponent from '@/components/pages-components/AboutPage';
import { useTranslation } from '@/i18n';

export async function generateMetadata({ params: { locale } }) {
    const { t } = await useTranslation(locale, 'seo');

    return {
        title: t('AboutPage-title'),
        description: t('AboutPage-description')
    };
}

export default function AboutPage({ params: { locale } }) {
    return <AboutPageComponent locale={locale} />
}
