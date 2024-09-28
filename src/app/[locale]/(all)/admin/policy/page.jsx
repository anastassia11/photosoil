import PolicyAdminComponent from '@/components/pages-components/admin/PolicyAdminComponent';
import { getTranslation } from '@/i18n';

export async function generateMetadata({ params: { locale } }) {
    const { t } = await getTranslation(locale);

    return {
        title: `${t('rules_service')} | ${t('dashboard')} | PhotoSOIL`,
    };
}

export default function PolicyAdminPage() {
    return <PolicyAdminComponent />
}