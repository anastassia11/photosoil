import { memo, useEffect, useRef } from 'react'
import LayersPanel from './LayersPanel'
import '@/scripts/open_layers/mapSelect/mapPointSelect.js'

const MapSelect = memo(function MapSelect({ }) {
    const didLogRef = useRef(false)

    useEffect(() => {
        if (didLogRef.current === false) {
            didLogRef.current = true
            window.CreatePointSelectMap('map', '#LatitudeDec', '#LongtitudeDec', '#LatitudeMinSec', '#LongtitudeMinSec', '#smbbtm');
        }
    }, [])

    return (
        <div id="map" className="mapdiv w-full h-full z-10 ">
            {/* <LayersPanel /> */}
        </div>
    )
})
export default MapSelect