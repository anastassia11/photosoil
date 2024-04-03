'use client'

import React, { memo, useEffect, useRef } from 'react'
import '@/scripts/open_layers/baseMap2d/baseMap2d.js'
import LayersPanel from './LayersPanel'
import Zoom from './Zoom'
import SideBar from './SideBar'

const Map = memo(function Map({ }) {
    const didLogRef = useRef(false)

    useEffect(() => {
        if (didLogRef.current === false) {
            didLogRef.current = true
            window.Create2dMap('map')
        }
    }, [])

    return (
        <div id="map" className="mapdiv w-full h-full z-10 "></div>
    )
})
export default Map
