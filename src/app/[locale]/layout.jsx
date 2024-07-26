import initTranslations from '@/app/i18n';
import TranslationsProvider from '@/components/TranslationsProvider';

const i18nNamespaces = ['system'];

export default async function TranslationsLayout({ params: { locale }, children }) {
    const { resources } = await initTranslations(locale, i18nNamespaces);

    return (
        <TranslationsProvider
            namespaces={i18nNamespaces}
            locale={locale}
            resources={resources} >
            {children}
        </TranslationsProvider>
    );
}
