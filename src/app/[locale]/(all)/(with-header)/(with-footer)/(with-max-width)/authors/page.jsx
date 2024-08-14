import Authors from '@/components/Authors';
import { useTranslation } from '@/i18n';

export async function generateMetadata({ params: { locale } }) {
    const { t } = await useTranslation(locale, 'seo');
    return {
        title: t(`AuthorsPage-title`),
        description: t(`AuthorsPage-description`)
    };
}

export default async function AuthorsPage({ params: { locale } }) {
    const { t } = await useTranslation(locale);
    return (
        <section className="flex flex-col">
            <h1 className='sm:text-2xl text-xl font-semibold mb-4'>
                {t('photo_authors')}
            </h1>
            <Authors />
        </section>
    )
}