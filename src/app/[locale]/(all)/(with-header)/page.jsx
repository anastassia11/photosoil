'use client'

import MainMap from '@/components/map/MainMap';

// export const metadata = {
//   title: "Визуальная база данных почв и экосистем | PhotoSOIL",
//   description: "База данных PhotoSOIL призвана стать научной площадкой для исследователей, желающих делиться своими фотографиями почв с теми, кому они могут быть потенциально полезны.",
// }

export default function HomePage() {

  return (
    <div className="relative w-screen h-[calc(100vh-64px)]">
      <MainMap />
    </div>
  );
}
