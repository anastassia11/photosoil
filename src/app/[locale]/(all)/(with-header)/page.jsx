import MainMap from '@/components/map/MainMap';
import { useTranslation } from '@/i18n';

export async function generateMetadata({ params: { locale } }) {
  const { t } = await useTranslation(locale, 'seo');

  return {
    title: t('HomePage-title'),
    description: t('HomePage-description')
  };
}

export default function HomePage() {
  return (
    <div className="relative w-screen h-[calc(100vh-64px)]">
      <MainMap />
    </div>
  );
}
// HomePage.withHeader = true;

