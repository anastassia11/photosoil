'use client'

import React, { memo, useEffect, useRef, useState } from 'react'
// import '@/scripts/open_layers/baseMap2d/baseMap2d.js'
import LayersPanel from './LayersPanel'
import Zoom from './Zoom'
import SideBar from './SideBar'
import { getSoils } from '@/api/soil/get_soils'
import { getEcosystems } from '@/api/ecosystem/get_ecosystems'

const Map = memo(function Map({ }) {
    const didLogRef = useRef(false)

    useEffect(() => {
        const initializeMap = () => {
            if (didLogRef.current === false) {
                didLogRef.current = true
                window.Create2dMap('map')
            }
        }

        if (document.getElementById('map')) {
            initializeMap()
        } else {
            document.addEventListener('DOMContentLoaded', initializeMap)
        }

        return () => {
            document.removeEventListener('DOMContentLoaded', initializeMap)
        }
    }, [])

    return (
        <div id="map" className="mapdiv w-full h-full z-10 "></div>
    )
})
export default Map
