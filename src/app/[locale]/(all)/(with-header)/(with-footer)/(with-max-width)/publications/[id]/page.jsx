import PublicationPageComponent from '@/components/pages-components/PublicationPage';
import { getTranslation } from '@/i18n';

export async function generateMetadata({ params: { locale } }) {
    const { t } = await getTranslation(locale);
    return {
        title: `${t('publication')} | PhotoSOIL`,
    };
}

export default function PublicationPage({ params: { id } }) {
    return <PublicationPageComponent id={id} />
}
