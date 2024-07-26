'use client'

import { getSoils } from '@/api/soil/get_soils';
import Soils from '@/components/soils/Soils';
import { BASE_URL } from '@/utils/constants';
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

export default function SoilsPage({ params: { type } }) {
    const [soils, setSoils] = useState([])
    const { t } = useTranslation();

    useEffect(() => {
        fetchSoils()
    }, [])

    const fetchSoils = async () => {
        // const { data } = await fetch('/api/soilObject')

        // console.log(data)
        // setSoils(data)


        const result = await getSoils()
        if (result.success) {
            setSoils(result.data)
        }
    }
    const items =
        type === 'soils' ? soils :
            type === 'profiles' ? soils.filter(soil => soil.objectType === 1) :
                type === 'dynamics' ? soils.filter(soil => soil.objectType === 0) :
                    type === 'morphological' ? soils.filter(soil => soil.objectType === 2) : []

    return (
        <div className='flex flex-col' >
            <h1 className='sm:text-2xl text-xl font-semibold mb-4'>
                {type === 'soils' ? t('search_all') :
                    type === 'profiles' ? t('profiles') :
                        type === 'dynamics' ? t('dynamics') :
                            type === 'morphological' ? t('morphological') : ''}
            </h1>
            <Soils soils={items} isAllSoils={type === 'soils'} type={type} isFilters={true} isDrafts={true} />
        </div >
    )
}
