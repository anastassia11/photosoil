import MainMap from '@/components/map/MainMap';

export const metadata = {
  title: "Визуальная база данных почв и экосистем | PhotoSOIL",
  description: "",
}

export default function HomePage() {

  return (
    <div className="relative w-screen h-[calc(100vh-64px)]">
      <MainMap />
    </div>
  );
}
