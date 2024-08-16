import ObjectsPageComponent from '@/components/pages-components/admin/ObjectsPage';
import { getTranslation } from '@/i18n';

export async function generateMetadata({ params: { locale } }) {
    const { t } = await getTranslation(locale);

    return {
        title: `${t('soils')} | ${t('dashboard')} | PhotoSOIL`,
    };
}

export default function ObjectsAdminPage() {
    return <ObjectsPageComponent />
}
