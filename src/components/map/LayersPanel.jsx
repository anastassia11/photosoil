import Link from 'next/link';
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next';

export default function LayersPanel({ onLayerChange, currentLayer }) {
    const [drapdownState, setDrapdownState] = useState({ isActive: false, key: null });
    const { t } = useTranslation();

    const layers = [
        { key: 'OSM', title: t('OSM') },
        { key: 'BingRoud', title: t('BingRoud') },
        { key: 'BingSat', title: t('BingSat') },
        { key: 'BingHibrid', title: t('BingHibrid') },
        { key: 'ArcGis_World_Imagery', title: t('ArcGis_World_Imagery') },
        { key: 'ArcGis_World_Topo_Map', title: t('ArcGis_World_Topo_Map') },
    ]

    useEffect(() => {
        document.onclick = (e) => {
            const target = e.target;
            if (!target.closest(".layer-menu")) setDrapdownState({ isActive: false, key: null });
        };
    }, [])

    return (
        <div className='layer-menu'>
            <div className='relative'>
                <button className='duration-300 bg-white rounded-md p-1 shadow-md text-zinc-600 hover:text-zinc-800 hover:shadow-lg'
                    onClick={() => setDrapdownState({ key: 'layer', isActive: !drapdownState.isActive })}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="currentColor">
                        <path d="M9.06 13L16 16.856 22.94 13 16 9.144 9.06 13zM16 19.144L4.94 13 16 6.856 27.06 13 16 19.144zm0 3.712l9-5L27.06 19 16 25.144 4.94 19 7 17.856l9 5z">
                        </path>
                    </svg>
                </button>
                {
                    drapdownState.key == 'layer' && drapdownState.isActive ? (
                        <div className="overflow-hidden w-[250px] absolute right-0 border shadow-md mt-0 bg-white rounded-md">
                            <ul className='py-2'>
                                {layers.map(({ key, title }) =>
                                    <li key={key} className={`baseLayerSelector flex flex-row justify-between duration-300 cursor-pointer hover:text-blue-600 h-9 hover:bg-zinc-100  
                                    items-center px-4
                                    ${currentLayer === key ? 'text-blue-600' : 'text-zinc-800'}`}
                                        onClick={() => {
                                            onLayerChange(key)
                                        }}>
                                        {title}
                                        {currentLayer === key ?
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="w-5 h-5 text-blue-600"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                    clipRule="evenodd"
                                                />
                                            </svg> : ''}
                                    </li>)}
                            </ul>
                        </div>
                    ) : ""
                }
            </div>
        </div >
    )
}
