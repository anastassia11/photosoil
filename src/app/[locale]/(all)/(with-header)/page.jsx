import MainMap from '@/components/map/MainMap';
import { getTranslation } from '@/i18n';
import { Suspense } from 'react';

export async function generateMetadata({ params: { locale } }) {
  const { t } = await getTranslation(locale, 'seo');

  return {
    title: t('homePage-title'),
    description: t('homePage-description')
  };
}

export default function HomePage() {
  return (
    <div className="relative w-screen h-[calc(100vh-64px)]">
      <Suspense>
        <MainMap />
      </Suspense>
    </div>
  );
}

