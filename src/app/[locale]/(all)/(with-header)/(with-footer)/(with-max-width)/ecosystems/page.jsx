import EcosystemsPageComponent from '@/components/pages-components/EcosystemsPage';
import { useTranslation } from '@/i18n';

export async function generateMetadata({ params: { locale } }) {
    const { t } = await useTranslation(locale, 'seo');
    return {
        title: t(`EcosystemsPage-title`),
        description: t(`EcosystemsPage-description`)
    };
}

export default function EcosystemsPage({ params: { locale } }) {
    return <EcosystemsPageComponent locale={locale} />
}
