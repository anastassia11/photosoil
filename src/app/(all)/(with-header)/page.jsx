'use client'

import DynamicMap from '@/components/map/DynamicMap';
import LayersPanel from '@/components/map/LayersPanel';
import SideBar from '@/components/map/SideBar';
import Zoom from '@/components/map/Zoom';

// export const metadata = {
//   title: "Визуальная база данных почв и экосистем | PhotoSOIL",
//   description: "База данных PhotoSOIL призвана стать научной площадкой для исследователей, желающих делиться своими фотографиями почв с теми, кому они могут быть потенциально полезны.",
// }

export default function HomePage() {

  return (
    <div className="relative w-screen h-[calc(100vh-64px)]">
      <DynamicMap />
      <div className='z-20 absolute top-0 right-0 m-2'>
        <LayersPanel />
      </div>
      <div className='z-30 absolute top-[calc(50%-100px)] right-0 m-2 '>
        <Zoom />
      </div>
      <SideBar />
    </div>
  );
}
