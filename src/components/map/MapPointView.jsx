'use client'

import { memo, useEffect, useRef } from 'react'
import '@/scripts/open_layers/mapSelect/mapPointView.js'

const MapPointView = memo(function MapPointView({ latitude, longtitude }) {
    const latDec = latitude
    const lonDec = longtitude
    const didLogRef = useRef(false)

    useEffect(() => {
        if (latitude != undefined) {
            window.CreatePointViewMap('map-point-view', latitude, longtitude);
        }
        // if (didLogRef.current === false) {
        //     didLogRef.current = true
        //     window.CreatePointViewMap('map-point-view', latDec, lonDec);
        // }
    }, [latitude, longtitude])

    return (
        <div id="map-point-view" className="mapdiv w-full h-full z-10 ">
            {/* <LayersPanel /> */}
        </div>
    )
})
export default MapPointView