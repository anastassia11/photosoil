'use client'
import React, { useState } from 'react'

export default function SideBar() {
    const [sidebarOpen, setSideBarOpen] = useState(true);
    const [soils, setSoils]=useState(true);
    const [ecosystems, setEcosystems]=useState(true);
    const [publications, setPublications]=useState(true);

    const handleViewSidebar = () => {
        setSideBarOpen(!sidebarOpen);
    };

    return (
        <div className={`${sidebarOpen ? 'left-0' : '-left-[308px]'} z-20 absolute top-0 w-[300px] h-[calc(100%-16px)] 
        shadow-lg bg-white duration-300 rounded-lg m-2`}>

            <div className='relative h-full'>
            <div class="px-3 pt-1">
        <div class="text-xl font-bold cursor-pointer pb-1">Слои карты</div>
            <div x-show="show" x-transition>
                <div class="form-control">
                    <label class="cursor-pointer label">
                        <span class="label-text">Почвенные объекты</span> 
                        <input type="checkbox" checked={soils} onChange={e=>setSoils(!soils)} data-scrtype="SoilObjects" class="toggle layerCheker toggle-primary"/>
                    </label>
                </div>
                <div class="form-control">
                    <label class="cursor-pointer label">
                        <span class="label-text">Метео станции</span> 
                        <input type="checkbox" checked={ecosystems} onChange={e=>setEcosystems(!ecosystems)} data-scrtype="EcoSystem" class="toggle layerCheker  toggle-secondary"/>
                    </label>
                </div>
                <div class="form-control">
                    <label class="cursor-pointer label">
                        <span class="label-text">Публикации</span> 
                        <input type="checkbox" checked={publications} onChange={e=>setPublications(!publications)} data-scrtype="Publication" class="toggle layerCheker toggle-accent"/>
                    </label>
                </div>

            </div>
        </div>
                <button onClick={handleViewSidebar} className="absolute -right-8 top-0 bg-white w-6 h-10 rounded-md shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"
                        className={`${sidebarOpen ? 'rotate-90' : '-rotate-90'}`}>
                        <path d="M15.793 9.4l1.414 1.414L12 16.024l-5.207-5.21L8.207 9.4 12 13.195z"></path>
                    </svg>
                </button>
            </div>
        </div>
    )
}
