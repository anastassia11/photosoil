'use client'

import React, { memo, } from 'react'

import { getTranslation } from '@/i18n/client'
import { Select, SelectContent, SelectItem, SelectTrigger } from '../ui/select'
import { Layers } from 'lucide-react'

const LayersPanel = memo(function LayersPanel({
	onLayerChange,
	currentLayer,
	locale
}) {
	const { t } = getTranslation(locale)

	const layers = [
		{ key: 'OSM', title: t('OSM') },
		// { key: 'BingRoud', title: t('BingRoud') },
		// { key: 'BingSat', title: t('BingSat') },
		// { key: 'BingHibrid', title: t('BingHibrid') },
		{ key: 'ArcGis_World_Imagery', title: t('ArcGis_World_Imagery') },
		{ key: 'ArcGis_World_Topo_Map', title: t('ArcGis_World_Topo_Map') }
	]

	return (
		<>
			<Select value={currentLayer}
				onValueChange={onLayerChange}>
				<SelectTrigger withoutIcon className="aspect-square size-10 p-0 flex items-center justify-center
					 bg-white rounded-md shadow-md border-none hover:shadow-lg duration-300">
					<Layers className='duration-300 text-zinc-800' strokeWidth={1.9} size={20} />
				</SelectTrigger>
				<SelectContent onCloseAutoFocus={e => e.preventDefault()}>
					{layers.map(({ key, title }) => (
						<SelectItem key={key} value={key}
							className='text-base cursor-pointer'>{title}</SelectItem>
					))}
				</SelectContent>
			</Select>
		</>
	)
})
export default LayersPanel
