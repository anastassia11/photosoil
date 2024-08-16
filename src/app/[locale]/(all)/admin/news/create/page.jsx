import CreateNewsComponent from '@/components/pages-components/admin/NewsCreate';
import { getTranslation } from '@/i18n';

export async function generateMetadata({ params: { locale } }) {
    const { t } = await getTranslation(locale);

    return {
        title: `${t('creation_news')} | ${t('dashboard')} | PhotoSOIL`,
    };
}

export default function NewsCreatePage() {
    return <CreateNewsComponent />
}
