'use client'

import { usePathname } from 'next/navigation'
import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { Oval } from 'react-loader-spinner'
import { useDispatch, useSelector } from 'react-redux'
// import { Tooltip } from 'react-tooltip'

import { setDropdown } from '@/store/slices/generalSlice'
import { openModal } from '@/store/slices/modalSlice'
import modalThunkActions from '@/store/thunks/modalThunk'

import { createTag } from '@/api/tags/create_tag'
import { deleteTag } from '@/api/tags/delete_tag'
import { putTag } from '@/api/tags/put_tag'

import { getTranslation } from '@/i18n/client'
import { select } from 'slate'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
import { ChevronDown, Search } from 'lucide-react'
import { Checkbox } from '../ui/checkbox'

const Filter = memo(
	function Filter({
		locale,
		type,
		itemId,
		name,
		sortByOrder,
		items,
		setTags,
		selectedItems,
		addItem,
		resetItems,
		selectAll,
		isMapFilter
	}) {
		const dispatch = useDispatch()
		const [filterOpen, setFilterOpen] = useState(false)
		const paths = usePathname()
		const pathNames = paths.split('/').filter(path => path)
		const searchRef = useRef(null)
		const dropdown = useSelector(state => state.general.dropdown)

		const [filterName, setFilterName] = useState('')

		const [formVisible, setFormVisible] = useState({
			visible: false,
			type: ''
		})
		const [isLoading, setIsLoading] = useState(false)
		const [tagData, setTagData] = useState({})
		const { t } = getTranslation(locale)

		const _id = itemId ? `filter-${itemId}` : name

		let _isEng = locale === 'en'

		const filteredItems = useMemo(() => {
			const _filterName = filterName.toLowerCase().trim()
			return items
				.filter(
					item =>
						item.name?.toLowerCase().includes(_filterName) ||
						item.codeEng?.toLowerCase().includes(_filterName) ||
						item.codeRu?.toLowerCase().includes(_filterName) ||
						item.dataEng?.name?.toLowerCase().includes(_filterName) ||
						item.dataRu?.name?.toLowerCase().includes(_filterName) ||
						item.nameEng?.toLowerCase().includes(_filterName) ||
						item.nameRu?.toLowerCase().includes(_filterName)
				)
				.sort((a, b) => {
					if (sortByOrder) return a.order - b.order
					if (
						a.name < b.name ||
						(_isEng
							? a.dataEng?.name < b.dataEng?.name
							: a.dataRu?.name < b.dataRu?.name) ||
						(_isEng ? a.nameEng < b.nameEng : a.nameRu < b.nameRu)
					)
						return -1
					if (
						a.name > b.name ||
						(_isEng
							? a.dataEng?.name > b.dataEng?.name
							: a.dataRu?.name > b.dataRu?.name) ||
						(_isEng ? a.nameEng > b.nameEng : a.nameRu > b.nameRu)
					)
						return 1
					return 0
				})
		}, [filterName, items, sortByOrder, _isEng])

		const handleOpenClick = () => {
			if (isMapFilter) {
				setFilterOpen(!filterOpen)
			} else {
				dispatch(
					setDropdown({
						key: _id,
						isActive:
							dropdown?.key !== null && dropdown?.key !== _id
								? true
								: !dropdown?.isActive
					})
				)
				// dropdownStore.key = _id
				// dropdownStore.isActive = dropdown?.key !== null && dropdown?.key !== _id
				// 	? true
				// 	: !dropdown?.isActive
			}
		}

		const handleAddTag = () => {
			setFormVisible(prev => ({ visible: true, type: 'create' }))
		}

		const handleCloseForm = () => {
			setFormVisible(prev => ({ visible: false, type: '' }))
			setTagData({})
		}

		const createNewTag = async e => {
			e.preventDefault()
			e.stopPropagation()
			setIsLoading(true)
			const result =
				formVisible.type === 'create'
					? await createTag(tagData)
					: await putTag({
						id: tagData.id,
						data: { nameRu: tagData.nameRu, nameEng: tagData.nameEng }
					})
			if (result.success) {
				formVisible.type === 'create'
					? setTags(prev => [...prev, result.data])
					: setTags(prev =>
						prev.map(item => (item.id === tagData.id ? result.data : item))
					)
				setFormVisible(prev => ({ visible: false, type: '' }))
				setTagData({})
			}
			setIsLoading(false)
		}

		const handleEditClick = (e, { id, nameEng, nameRu }) => {
			e.stopPropagation()

			setTagData({ id, nameEng, nameRu })
			setFormVisible(prev => ({ visible: true, type: 'edit' }))
		}

		const fetchDeleteTag = async id => {
			const result = await deleteTag(id)
			if (result.success) {
				setTags(prev => prev.filter(item => item.id !== id))
			} else {
			}
		}

		const handleDeleteClick = async (e, id) => {
			dispatch(
				openModal({
					title: t('warning'),
					message: t('delete_tag'),
					buttonText: t('delete'),
					type: 'delete'
				})
			)

			const isConfirm = await dispatch(modalThunkActions.open())
			if (isConfirm.payload) {
				await fetchDeleteTag(id)
			}
		}

		const TagForm = () => (
			<div className='tag-form bg-black/30 fixed top-0 left-0 z-50 overflow-y-auto w-screen h-screen'>
				<div className='flex items-center h-full justify-center px-4 pt-4 pb-20 ml-[290px] text-center'>
					<div className='relative inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:w-full sm:max-w-md sm:p-6 sm:align-middle'>
						<h3
							className='text-center text-lg font-medium leading-6 text-gray-800 capitalize'
							id='modal-title'
						>
							{t('new_tag')}
						</h3>
						<ul className='my-2 space-y-3'>
							<div>
								<label className='font-medium'>{t('name')}</label>
								<input
									name='nameRu'
									onChange={e =>
										setTagData(prev => ({ ...prev, nameRu: e.target.value }))
									}
									value={tagData.nameRu}
									type='text'
									className='bg-white w-full mt-1 p-2 outline-none border focus:border-blue-600 shadow-sm rounded-md'
								/>
							</div>
							<div>
								<label className='font-medium'>{`${t('name')} (EN)`}</label>
								<input
									name='nameEng'
									onChange={e =>
										setTagData(prev => ({ ...prev, nameEng: e.target.value }))
									}
									value={tagData.nameEng}
									type='text'
									className='bg-white w-full mt-1 p-2 outline-none border focus:border-blue-600 shadow-sm rounded-md'
								/>
							</div>
						</ul>
						<div className='mt-8'>
							<div className='mt-4 sm:flex sm:items-center sm:-mx-2'>
								<button
									type='button'
									onClick={handleCloseForm}
									className='w-full px-4 py-2 font-medium tracking-wide text-gray-700 capitalize transition-colors duration-300 transform border border-gray-200 rounded-md sm:w-1/2 sm:mx-2 focus:outline-none'
								>
									{t('cancel')}
								</button>
								<button
									onClick={createNewTag}
									type='button'
									disabled={isLoading}
									className='flex items-center justify-center w-full px-4 py-2 mt-3 font-medium tracking-wide text-white capitalize transition-colors duration-300 transform 
                                    bg-blue-600 rounded-lg hover:bg-blue-500 focus:outline-none active:bg-blue-600 sm:mt-0 sm:w-1/2 sm:mx-2'
								>
									{isLoading ? (
										<Oval
											height={20}
											width={20}
											color='#FFFFFF'
											visible={true}
											ariaLabel='oval-loading'
											secondaryColor='#FFFFFF'
											strokeWidth={4}
											strokeWidthSecondary={4}
										/>
									) : (
										t('_save')
									)}
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		)

		return (
			<div className='select-none flex gap-8 w-full'>
				<div className='relative w-full'>
					<div
						className='filter_dropdown'
						id='filter_dropdown'
					>
						<Tooltip>
							<TooltipTrigger asChild>
								<div
									className={`overflow-visible flex cursor-pointer items-center justify-between gap-2 ${!isMapFilter ? 'bg-white border h-[40px] pl-3 pr-2' : ''} transition rounded-md`}
									onClick={handleOpenClick}
								>
									<span
										className={`text-base overflow-hidden whitespace-nowrap text-ellipsis duration-300
                        ${isMapFilter && filterOpen && 'font-medium text-blue-700'} ${!isMapFilter && 'font-medium'}`}
									>
										{name}
									</span>

									<span
										className={`flex flex-row items-center justify-center space-x-1`}
									>
										{selectedItems?.length ? (
											<span>
												<svg
													className='w-1.5 h-1.5'
													viewBox='0 0 16 16'
													fill='none'
													xmlns='http://www.w3.org/2000/svg'
												>
													<g
														id='SVGRepo_bgCarrier'
														strokeWidth='0'
													></g>
													<g
														id='SVGRepo_tracerCarrier'
														strokeLinecap='round'
														strokeLinejoin='round'
													></g>
													<g id='SVGRepo_iconCarrier'>
														<circle
															cx='8'
															cy='8'
															r='8'
															fill='#2563eb'
														></circle>
													</g>
												</svg>
											</span>
										) : (
											''
										)}
										<ChevronDown size={18} strokeWidth={1.5} className={`transition ${(dropdown?.key == _id && dropdown?.isActive) || filterOpen ? '-rotate-180' : ''}`} />
									</span>
								</div>
							</TooltipTrigger>
							<TooltipContent side={isMapFilter ? 'right' : 'top'}>
								<p>{name}</p>
							</TooltipContent>
						</Tooltip>
						<div
							className={`w-full duration-200 transition-all ${!isMapFilter ? 'top-[30px] absolute border overflow-hidden z-50' : ''} 
                    ${isMapFilter
									? filterOpen
										? 'block'
										: 'hidden'
									: dropdown?.key == _id && dropdown?.isActive
										? 'visible translate-y-4'
										: 'invisible opacity-0'
								}
                     rounded-md border-gray-200 bg-white`}
						>
							<header
								className={`flex items-center justify-between ${!isMapFilter ? 'px-3 py-2' : 'px-4 py-1 pt-2'}`}
							>
								<span className=' text-gray-700'>
									{selectedItems?.length} {t('select')}{' '}
								</span>

								<button
									type='button'
									className=' text-gray-900 underline underline-offset-4'
									onClick={() => (selectedItems.length || !selectAll) ? resetItems(selectedItems) : selectAll()}
								>
									{(selectedItems.length || !selectAll) ? t('reset') : t('select_all')}
								</button>
							</header>

							<div
								className={`relative ${isMapFilter ? 'mx-2.5 px-1.5' : 'w-full '}`}
							>
								<Search className={`absolute top-0 bottom-0 w-5 h-5 my-auto text-zinc-400 ${isMapFilter ? 'left-1.5' : 'left-3'}`} />
								<input
									value={filterName}
									ref={searchRef}
									type='text'
									placeholder={t('search')}
									className={`w-full pr-4  outline-none  ${isMapFilter ? 'border-b focus:border-blue-600 py-1 pl-[32px]'
										: `py-2 pl-10 border-y`}`}
									onChange={e => setFilterName(e.target.value)}
								/>
							</div>
							{(!!filteredItems.length &&
								((type === 'ecosystem' || type === 'soil' || type === 'publications') ? filterName.length > 2 : true)) && (
									<ul
										className={`scroll space-y-2 max-h-[200px] overflow-auto py-2 ${isMapFilter ? 'px-4' : 'px-3'}`}
									>
										{filteredItems.map(
											({ name, id, dataRu, dataEng, nameEng, nameRu }) => {
												const isValid =
													(_isEng
														? (nameEng && nameEng !== '') ||
														(dataEng && dataEng.name !== '')
														: (nameRu && nameRu !== '') ||
														(dataRu && dataRu.name !== '')) || name
												if (isValid)
													return (
														<li
															key={`Item${type ? `-${type}-${id}` : `-${id}`}`}
															className='flex flex-row justify-between group'
														>
															<div className="w-full max-w-full flex items-top space-x-2">
																<Checkbox id={`Item${type ? `-${type}-${id}` : `-${id}`}`}
																	checked={selectedItems?.includes(id)}
																	onCheckedChange={() => addItem(id)} />
																<label
																	style={{
																		fontWeight: '350',
																	}}
																	htmlFor={`Item${type ? `-${type}-${id}` : `-${id}`}`}
																	className="select-none pt-[2px] text-base cursor-pointer leading-none"
																>
																	{name ||
																		(_isEng ? nameEng : nameRu) ||
																		(_isEng ? dataEng?.name : dataRu?.name)}
																</label>
															</div>
															{(pathNames.includes('create') ||
																pathNames.includes('edit')) &&
																pathNames.includes('news') ? (
																<span className='flex flex-row'>
																	<button
																		onClick={e =>
																			handleEditClick(e, { id, nameEng, nameRu })
																		}
																		type='button'
																		className='group-hover:visible invisible mr-3 text-gray-500 hover:text-gray-700'
																	>
																		<svg
																			xmlns='http://www.w3.org/2000/svg'
																			fill='none'
																			viewBox='0 0 24 24'
																			strokeWidth={1.5}
																			stroke='currentColor'
																			className='size-5'
																		>
																			<path
																				strokeLinecap='round'
																				strokeLinejoin='round'
																				d='m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125'
																			/>
																		</svg>
																	</button>
																	<button
																		onClick={e => handleDeleteClick(e, id)}
																		type='button'
																		className='group-hover:visible invisible text-gray-500 hover:text-red-700'
																	>
																		<svg
																			xmlns='http://www.w3.org/2000/svg'
																			fill='none'
																			viewBox='0 0 24 24'
																			strokeWidth={1.5}
																			stroke='currentColor'
																			className='size-5'
																		>
																			<path
																				strokeLinecap='round'
																				strokeLinejoin='round'
																				d='m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0'
																			/>
																		</svg>
																	</button>
																</span>
															) : (
																''
															)}
														</li>
													)
											}
										)}
									</ul>)}

							{(pathNames.includes('create') || pathNames.includes('edit')) &&
								pathNames.includes('news') ? (
								<button
									type='button'
									className='font-medium text-blue-600 w-fit ml-4 mb-2'
									onClick={handleAddTag}
								>
									<span className='text-2xl pr-2'>+</span>
									{t('add_tag')}
								</button>
							) : (
								''
							)}
						</div>
					</div>
					{pathNames.includes('create') || pathNames.includes('edit') ? (
						<ul className='mt-2 flex flex-row flex-wrap w-fit max-w-full'>
							{selectedItems?.map(_id =>
								items.map(({ name, id, dataRu, dataEng, nameEng, nameRu }) => {
									if (id === _id) {
										const isValid = _isEng
											? (nameEng && nameEng !== '') ||
											(dataEng && dataEng.name !== '')
											: (nameRu && nameRu !== '') ||
											(dataRu && dataRu.name !== '')
										if (isValid)
											return (
												<li
													key={id}
													className='line-clamp-1 border border-zinc-400 rounded-full w-fit max-w-full h-fit px-2 flex flex-row justify-center space-x-2 mr-2 mb-1'
												>
													<p className='max-w-full line-clamp-1'>
														{name ||
															(_isEng ? nameEng : nameRu) ||
															(_isEng ? dataEng?.name : dataRu?.name)}
													</p>
													<button
														className='text-black pt-[1px]'
														onClick={() => addItem(_id)}
													>
														<svg
															width='800px'
															height='800px'
															viewBox='0 0 24 24'
															fill='none'
															xmlns='http://www.w3.org/2000/svg'
															className='w-[10px] h-[10px]'
														>
															<g id='Menu / Close_LG'>
																<path
																	id='Vector'
																	d='M21 21L12 12M12 12L3 3M12 12L21.0001 3M12 12L3 21.0001'
																	stroke='currentColor'
																	strokeWidth='3'
																	strokeLinecap='round'
																	strokeLinejoin='round'
																/>
															</g>
														</svg>
													</button>
												</li>
											)
									}
								})
							)}
						</ul>
					) : (
						''
					)}
				</div>
				{formVisible.visible ? TagForm() : ''}
			</div>
		)
	},
	// (prevProps, nextProps) => {
	// 	return (
	// 		prevProps.type === nextProps.type &&
	// 		prevProps.selectedItems?.toString() ===
	// 		nextProps.selectedItems?.toString() &&
	// 		prevProps.items === nextProps.items &&
	// 		prevProps.name === nextProps.name &&
	// 		prevProps.addItem === nextProps.addItem
	// 	)
	// }
)

export default Filter
