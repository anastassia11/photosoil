'use client'

import { getEcosystems } from '@/api/ecosystem/get_ecosystems'
import Soils from '@/components/soils/Soils';
import { Suspense, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next';

export default function EcosystemsPage() {
    const [ecosystems, setEcosystems] = useState([]);
    const { t } = useTranslation();

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
            <h1 className='sm:text-2xl text-xl font-semibold mb-4'>
                {t('ecosystems')}
            </h1>
            <Soils soils={ecosystems} type='ecosystems' isFilters={false} isDrafts={true} />
            {/* <Suspense fallback={<div>Loading...</div>}>
                <Soils soils={ecosystems} type='ecosystems' isFilters={false} isDrafts={true} />
            </Suspense> */}
        </div >
    )
}
