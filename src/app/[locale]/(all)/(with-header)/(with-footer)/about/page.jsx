import AboutPageComponent from '@/components/pages-components/AboutPage';
import { getTranslation } from '@/i18n';

export async function generateMetadata({ params: { locale } }) {
    const { t } = await getTranslation(locale, 'seo');

    return {
        title: t('aboutPage-title'),
        description: t('aboutPage-description')
    };
}

export default function AboutPage({ params: { locale } }) {
    return <AboutPageComponent locale={locale} />
}
