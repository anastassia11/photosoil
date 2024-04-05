'use client'

import { getSoils } from '@/api/get_soils';
import Soils from '@/components/soils/Soils';
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';

export default function SoilsPage({ params: { type } }) {
    const [soils, setSoils] = useState([])

    useEffect(() => {
        fetchSoils()
    }, [])

    const fetchSoils = async () => {
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
            <h1 className='text-2xl font-semibold mb-4'>
                {type === 'soils' ? 'Поиск по всем объектам' :
                    type === 'profiles' ? 'Почвенные профили' :
                        type === 'dynamics' ? 'Динамика почв' :
                            type === 'morphological' ? 'Почвенные морфологические элементы' : ''}
            </h1>
            <Soils soils={items} isAllSoils={type === 'soils'} type='soils' />
        </div >
    )
}
