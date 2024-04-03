'use client'

import React, { memo, useEffect, useRef, useState } from 'react'
import '@/scripts/open_layers/baseMap2d/baseMap2d.js'
import LayersPanel from './LayersPanel'
import Zoom from './Zoom'
import SideBar from './SideBar'
import { getSoils } from '@/api/get_soils'
import { getEcosystems } from '@/api/get_ecosystems'

const Map = memo(function Map({ }) {
    const didLogRef = useRef(false)
    const [soils, setSoils] = useState([]);
    // const [publications, setPublications] = useState([]);
    const [ecosystems, setEcosystems] = useState([]);

    useEffect(() => {
        fetchSoils()
        fetchEcosystems()
    }, [])

    const fetchSoils = async () => {
        const result = await getSoils()
        if (result.success) {
            setSoils(result.data)
        }
    }

    const fetchEcosystems = async () => {
        const result = await getEcosystems()
        if (result.success) {
            setEcosystems(result.data)
        }
    }


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
