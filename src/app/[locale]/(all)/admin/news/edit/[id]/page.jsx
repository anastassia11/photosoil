import NewsEditComponent from '@/components/pages-components/admin/NewsEdit';
import { getTranslation } from '@/i18n';

export async function generateMetadata({ params: { locale } }) {
    const { t } = await getTranslation(locale);
    return {
        title: `${t('edit_news')} | ${t('dashboard')} | PhotoSOIL`,
    };
}

export default function EditNewsPage({ params: { id } }) {
    return <NewsEditComponent id={id} />
}
