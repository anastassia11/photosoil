import Authors from '@/components/Authors';
import { getTranslation } from '@/i18n';

export async function generateMetadata({ params: { locale } }) {
    const { t } = await getTranslation(locale, 'seo');
    return {
        title: t(`authorsPage-title`),
        description: t(`authorsPage-description`)
    };
}

export default async function AuthorsPage({ params: { locale } }) {
    const { t } = await getTranslation(locale);
    return (
        <section className="flex flex-col">
            <h1 className='sm:text-2xl text-xl font-semibold mb-4'>
                {t('photo_authors')}
            </h1>
            <Authors />
        </section>
    )
}