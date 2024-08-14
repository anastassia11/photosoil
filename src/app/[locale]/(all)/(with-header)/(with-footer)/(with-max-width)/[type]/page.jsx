import SoilsPageComponent from '@/components/pages-components/SoilsPage';
import { useTranslation } from '@/i18n';

export async function generateMetadata({ params: { locale, type } }) {
    const { t } = await useTranslation(locale, 'seo');
    return {
        title: t(`${type}Page-title`),
        description: t(`${type}Page-description`)
    };
}

export default function SoilsPage({ params: { type, locale } }) {
    return <SoilsPageComponent type={type} locale={locale} />
}
