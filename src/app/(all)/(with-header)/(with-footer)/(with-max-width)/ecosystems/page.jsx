'use client'

import { getEcosystems } from '@/api/get_ecosystems'
import Soils from '@/components/soils/Soils';
import { Suspense, useEffect, useState } from 'react'

export default function EcosystemsPage() {
    const [ecosystems, setEcosystems] = useState([]);

    useEffect(() => {
        fetchEcosystems()
    }, [])

    const fetchEcosystems = async () => {
        const result = await getEcosystems()
        if (result.success) {
            setEcosystems(result.data)
        }
    }

    return (
        <div className='flex flex-col'>
            <h1 className='text-2xl font-semibold mb-4'>
                Экосистемы
            </h1>
            <Suspense fallback={<div>Loading...</div>}>
                <Soils soils={ecosystems} type='ecosystems' />
            </Suspense>
        </div >
    )
}
