'use client'
import React, { useState } from 'react'

export default function SideBar() {
    const [sidebarOpen, setSideBarOpen] = useState(false);
    const [soils, setSoils] = useState(true);
    const [ecosystems, setEcosystems] = useState(true);
    const [publications, setPublications] = useState(true);

    const handleViewSidebar = () => {
        setSideBarOpen(!sidebarOpen);
    };

    return (
        <div className={`${sidebarOpen ? 'left-0' : '-left-[358px]'} z-20 absolute top-0 w-[350px] h-[calc(100%-16px)] 
        shadow-lg bg-white duration-300 rounded-lg m-2 flex flex-row`}>

            <div className='relative h-full flex-1 min-w-fit'>
                <button onClick={handleViewSidebar} className="absolute -right-7 top-0 bg-white w-6 h-10 rounded-md shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"
                        className={`${sidebarOpen ? 'rotate-90' : '-rotate-90'}`}>
                        <path d="M15.793 9.4l1.414 1.414L12 16.024l-5.207-5.21L8.207 9.4 12 13.195z"></path>
                    </svg>
                </button>
                <div className='bg-white absolute rounded-lg left-[395px] top-0 shadow-lg'>
                    <div className="px-3 pt-1 min-w-[300px]">
                        <label
                            for="AcceptConditions"
                            className="z-50 relative h-8 w-14 cursor-pointer rounded-full bg-gray-300 transition [-webkit-tap-highlight-color:_transparent] has-[:checked]:bg-green-500"
                        >
                            <input type="checkbox" id="AcceptConditions" className="peer sr-only z-50" />

                            <div className="toggle z-50 absolute inset-y-0 start-0 m-1 size-6 rounded-full bg-white transition-all peer-checked:start-6"></div>
                        </label>
                        <div x-show="show" x-transition>
                            <div className="form-control">
                                <label className="cursor-pointer label">
                                    <span className="label-text">Почвенные объекты</span>
                                    <input type="checkbox" checked={soils} onChange={e => setSoils(!soils)} data-scrtype="SoilObjects" className="toggle layerCheker toggle-primary" />
                                </label>
                            </div>
                            <div className="form-control">
                                <label className="cursor-pointer label">
                                    <span className="label-text">Экосистемы</span>
                                    <input type="checkbox" checked={ecosystems} onChange={e => setEcosystems(!ecosystems)} data-scrtype="EcoSystem" class="toggle layerCheker  toggle-secondary" />
                                </label>
                            </div>
                            <div className="form-control">
                                <label className="cursor-pointer label">
                                    <span className="label-text">Публикации</span>
                                    <input type="checkbox" checked={publications} onChange={e => setPublications(!publications)} data-scrtype="Publication" class="toggle layerCheker toggle-accent" />
                                </label>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}
