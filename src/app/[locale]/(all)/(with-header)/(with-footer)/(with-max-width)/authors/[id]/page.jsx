import AuthorPageComponent from '@/components/pages-components/AutorPage';
import { getTranslation } from '@/i18n';

export async function generateMetadata({ params: { locale } }) {
    const { t } = await getTranslation(locale);
    return {
        title: `${t('photo_author')} | PhotoSOIL`,
    };
}

export default function AuthorPage({ params: { id } }) {
    return <AuthorPageComponent id={id} />
}