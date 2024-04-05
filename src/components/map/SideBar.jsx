"use client";
import React, { useEffect, useState } from "react";
import "@/scripts/open_layers/baseMap2d/baseMap2d.js";
import { posts } from "../../scripts/open_layers/baseMap2d/baseMap2d";
import { BASE_SERVER_URL } from "@/utils/constants";

let selectedData = "";

export const handleSelectedData = (data) => {
  selectedData = data;
  console.log(selectedData);
  console.log(data);
};

export default function SideBar() {
  const [sidebarOpen, setSideBarOpen] = useState(true);
  const [soils, setSoils] = useState(true);
  const [ecosystems, setEcosystems] = useState(true);
  const [publications, setPublications] = useState(true);
  const [location, setLocation] = useState([]);

  const [selectedData, setSelectedData] = useState([]);

  const handleSelectedDataChande = (e) => {
    console.log(e);

    setSelectedData(e.target.value);
    requestSelected(e.target.value);
  };

  useEffect(() => {
    console.log(selectedData);
  }, [selectedData]);

  const handleViewSidebar = () => {
    setSideBarOpen(!sidebarOpen);
  };
  const handleSearch = async (value) => {
    const params = {
      q: value,
      format: "json",
      addressdetails: 1,
      polygon_geojson: 0,
    };
    const queryString = new URLSearchParams(params).toString();
    const requestOptions = {
      method: "GET",
      redirect: "follow",
    };

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?${queryString}`,
        requestOptions
      );
      const result = await response.json();

      if (result.length > 0) {
        setLocation(result);
        console.log(location);
      }
    } catch (err) {
      console.log("err", err);
    }
  };
  const requestSelected = async (value) => {
    console.log(value);
    const requestOptions = {
      method: "GET",
      redirect: "follow",
    };

    try {
      const response = await fetch(
        `${BASE_SERVER_URL}${value}`,
        requestOptions
      );
      const result = await response.json();
      console.log(result);
      setSelectedData(result);
    } catch (err) {
      console.log("err", err);
    }
  };

  return (
    <>
      <div
        className={`${
          sidebarOpen ? "left-0" : "-left-[358px]"
        } z-20 absolute top-0 w-[350px] h-[calc(100%-16px)] 
        shadow-lg bg-white duration-300 rounded-lg m-2 flex flex-row`}
      >
        <div className="relative h-full flex-1 min-w-fit">
          <button
            onClick={handleViewSidebar}
            className="absolute -right-7 top-0 bg-white w-6 h-10 rounded-md shadow-md"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
              className={`${sidebarOpen ? "rotate-90" : "-rotate-90"}`}
            >
              <path d="M15.793 9.4l1.414 1.414L12 16.024l-5.207-5.21L8.207 9.4 12 13.195z"></path>
            </svg>
          </button>
          <div>
            <div className="p-4">
              <div className="relative w-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="absolute top-0 bottom-0 w-6 h-6 my-auto text-zinc-400 left-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  onChange={(e) => handleSearch(e.target.value)}
                  type="text"
                  placeholder="Поиск по названию региона"
                  className="w-full py-2 pl-12 pr-4 border rounded-md outline-none bg-white focus:border-blue-600"
                />
              </div>
        

            </div>

            <div className="">
              <div className="dropdown">
                <ul className="dropdown-menu space-y-5 px-4">
                  {location.map((item) => (
                    <li key={item.id} className=""> 
                      <div
                        className="cursor-pointer border-b"
                        onClick={() => window.selectLocationHandler(item)}
                      >
                        <div className="flex items-center space-x-3">
                            <img className="w-8 h-8" src='/map-marker.svg' alt="Logo" />
                            <p>
                                {item.display_name}
                            </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white absolute rounded-lg left-[395px] top-0 shadow-lg">
            <div className="py-4 px-4 min-w-[300px]">
              <div className="text-xl font-bold cursor-pointer pb-3">
                Слои карты
              </div>
              <div x-show="show" x-transition className="space-y-3">
                <div className="form-control">
                  <label className="flex justify-between cursor-pointer label">
                    <span className="label-text">Почвенные объекты</span>
                    <label class="inline-flex items-center cursor-pointer">
                      <input
                        checked={soils}
                        onChange={(e) => setSoils(!soils)}
                        data-scrtype="SoilObjects"
                        type="checkbox"
                        value=""
                        class="sr-only peer toggle layerCheker toggle-primary"
                      />
                      <div class="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                    </label>
                  </label>
                </div>
                <div className="form-control">
                  <label className="flex justify-between cursor-pointer label">
                    <span className="label-text">Экосистемы</span>
                    <label class="inline-flex items-center  cursor-pointer">
                      <input
                        checked={ecosystems}
                        onChange={(e) => setEcosystems(!ecosystems)}
                        data-scrtype="EcoSystem"
                        type="checkbox"
                        value=""
                        class="sr-only peer toggle layerCheker toggle-primary"
                      />
                      <div class="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700  peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-teal-600"></div>
                    </label>
                  </label>
                </div>
                <div className="form-control">
                  <label className="flex justify-between cursor-pointer label">
                    <span className="label-text">Публикации</span>
                    <label class="inline-flex items-center cursor-pointer">
                      <input
                        checked={publications}
                        onChange={(e) => setPublications(!publications)}
                        data-scrtype="Publication"
                        type="checkbox"
                        value=""
                        class="sr-only peer toggle layerCheker toggle-primary"
                      />
                      <div class="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700  peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-600"></div>
                    </label>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <div className={`${sidebarOpen ? 'left-0' : '-left-[308px]'} z-20 absolute top-0 w-[300px] h-[calc(100%-16px)] 
        shadow-lg bg-white duration-300 rounded-lg m-2`}>
            <div className='flex'>
                <input id="search" type='text'
                 onChange={(e) => handleSearch(e.target.value)} className='w-full border' />
                <button id="btnsearch" >Поиск</button>
            </div>
            
            <div className=''>
            <div className="dropdown">
                <ul className="dropdown-menu">
                    {location.map((item) => (
                        <li key={item.id}>
                            <a href="#" className='border-b pb-1' onClick={() => window.selectLocationHandler(item)}>{item.name}</a>
                        </li>
                    ))}
                </ul>
            </div>

        </div>
        
        <input id="selectInput" hidden onChange={handleSelectedDataChande} value="" />
        <div id="mapinfobox"> </div>
        
            <div className='relative h-full'>
                <button onClick={handleViewSidebar} className="absolute -right-8 top-0 bg-white w-6 h-10 rounded-md shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"
                        className={`${sidebarOpen ? 'rotate-90' : '-rotate-90'}`}>
                        <path d="M15.793 9.4l1.414 1.414L12 16.024l-5.207-5.21L8.207 9.4 12 13.195z"></path>
                    </svg>
                </button>
                <div className='bg-white absolute rounded-lg left-[395px] top-0 shadow-lg'>
                    <div className="py-4 px-4 min-w-[300px]">


                    <div className="text-xl font-bold cursor-pointer pb-3">Слои карты</div>
                            <div x-show="show" x-transition className='space-y-3'>
                            <div className="form-control">
                                <label className="flex justify-between cursor-pointer label">
                                    <span className="label-text">Почвенные объекты</span>
                                    <label class="inline-flex items-center cursor-pointer">
                                        <input checked={soils} onChange={e => setSoils(!soils)} data-scrtype="SoilObjects" type="checkbox" value="" class="sr-only peer toggle layerCheker toggle-primary" />
                                        <div class="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                                    </label>
                               </label>


                            </div>
                            <div className="form-control">
                                <label className="flex justify-between cursor-pointer label">
                                    <span className="label-text">Экосистемы</span>
                                    <label class="inline-flex items-center  cursor-pointer">
                                        <input  checked={ecosystems} onChange={e => setEcosystems(!ecosystems)} data-scrtype="EcoSystem"  type="checkbox" value="" class="sr-only peer toggle layerCheker toggle-primary" />
                                        <div class="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700  peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-teal-600"></div>
                                    </label>
                                </label>
                            </div>
                            <div className="form-control">
                                <label className="flex justify-between cursor-pointer label">
                                    <span className="label-text">Публикации</span>
                                    <label class="inline-flex items-center cursor-pointer">
                                        <input  checked={publications} onChange={e => setPublications(!publications)} data-scrtype="Publication" type="checkbox" value="" class="sr-only peer toggle layerCheker toggle-primary" />
                                        <div class="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700  peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-600"></div>
                                    </label>
                                </label>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div> */}
    </>
  );
}
