import PublicationCreateComponent from '@/components/pages-components/admin/PublicationCreate';
import { getTranslation } from '@/i18n';

export async function generateMetadata({ params: { locale } }) {
    const { t } = await getTranslation(locale);

    return {
        title: `${t('creation_publication')} | ${t('dashboard')} | PhotoSOIL`,
    };
}

export default function PublicationCreatePage() {
    return <PublicationCreateComponent />
}
