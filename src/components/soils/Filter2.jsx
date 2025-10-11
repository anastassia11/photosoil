'use client'

import { usePathname } from 'next/navigation'
import { memo, useMemo, useState } from 'react'
import { Oval } from 'react-loader-spinner'
import { useDispatch, useSelector } from 'react-redux'
import { ChevronDown, Search, Pencil, Trash2 } from 'lucide-react'

import { openModal } from '@/store/slices/modalSlice'
import modalThunkActions from '@/store/thunks/modalThunk'

import { createTag } from '@/api/tags/create_tag'
import { deleteTag } from '@/api/tags/delete_tag'
import { putTag } from '@/api/tags/put_tag'

import { getTranslation } from '@/i18n/client'

// shadcn/ui imports
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Input2 } from '../ui/input'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'

const Filter = memo(function Filter({
    locale,
    type,
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
    const paths = usePathname()
    const pathNames = paths.split('/').filter(path => path)
    const { isOpen } = useSelector(state => state.modal)
    const [open, setOpen] = useState(false)
    const [filterName, setFilterName] = useState('')
    const [dialogOpen, setDialogOpen] = useState(false)
    const [dialogMode, setDialogMode] = useState('create') // 'create' | 'edit'
    const [isLoading, setIsLoading] = useState(false)
    const [tagData, setTagData] = useState({})

    const { t } = getTranslation(locale)
    const _isEng = locale === 'en'

    // Фильтрация и сортировка - мемоизированы
    const filteredItems = useMemo(() => {
        const _filterName = filterName.toLowerCase().trim()
        return items
            .filter(item =>
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

                const aName = a.name ||
                    (_isEng ? a.dataEng?.name || a.nameEng : a.dataRu?.name || a.nameRu)
                const bName = b.name ||
                    (_isEng ? b.dataEng?.name || b.nameEng : b.dataRu?.name || b.nameRu)

                return aName?.localeCompare(bName) || 0
            })
    }, [filterName, items, sortByOrder, _isEng])

    // функция для выбора всех отфильтрованных элементов
    const handleSelectAll = () => {
        const idsToSelect = filteredItems.map(item => item.id)
        if (selectAll) {
            // Если selectAll принимает параметр - передаем отфильтрованные ID
            selectAll(idsToSelect)
        } else {
            // Иначе добавляем каждый элемент по отдельности
            idsToSelect.forEach(id => {
                if (!selectedItems?.includes(id)) {
                    addItem(id)
                }
            })
        }
    }
    const handleAddTag = () => {
        setDialogMode('create')
        setTagData({})
        setDialogOpen(true)
    }

    const handleEditTag = (e, { id, nameEng, nameRu }) => {
        e.stopPropagation()
        setDialogMode('edit')
        setTagData({ id, nameEng, nameRu })
        setDialogOpen(true)
    }

    const handleSaveTag = async (e) => {
        e.preventDefault()
        setIsLoading(true)

        const result = dialogMode === 'create'
            ? await createTag(tagData)
            : await putTag({
                id: tagData.id,
                data: { nameRu: tagData.nameRu, nameEng: tagData.nameEng }
            })

        if (result.success) {
            if (dialogMode === 'create') {
                setTags(prev => [...prev, result.data])
            } else {
                setTags(prev =>
                    prev.map(item => item.id === tagData.id ? result.data : item)
                )
            }
            setDialogOpen(false)
            setTagData({})
        }
        setIsLoading(false)
    }

    const handleDeleteTag = async (e, id) => {
        e.stopPropagation()

        dispatch(openModal({
            title: t('warning'),
            message: t('delete_tag'),
            buttonText: t('delete'),
            type: 'delete'
        }))

        const isConfirm = await dispatch(modalThunkActions.open())
        if (isConfirm.payload) {
            const result = await deleteTag(id)
            if (result.success) {
                setTags(prev => prev.filter(item => item.id !== id))
            }
        }
    }

    const getItemName = (item) => {
        return item.name ||
            (_isEng ? item.nameEng : item.nameRu) ||
            (_isEng ? item.dataEng?.name : item.dataRu?.name)
    }

    const showCanEdit = (pathNames.includes('create') || pathNames.includes('edit'))
        && pathNames.includes('news')

    const shouldShowItems = filteredItems.length > 0 &&
        ((type === 'ecosystem' || type === 'soil' || type === 'publications')
            ? filterName.length > 2
            : true)

    return (
        <div className='select-none flex gap-8 w-full'>
            <div className='relative w-full'>
                {isMapFilter ? (
                    // ДЛЯ КАРТЫ - inline раскрытие
                    <>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="shadow-none p-0 h-fit border-0 hover:bg-transparent w-full justify-between font-medium"
                                    onClick={() => setOpen(!open)}
                                >
                                    <span className={`text-base font-normal overflow-hidden whitespace-nowrap 
                        text-ellipsis ${open ? 'font-medium text-blue-700' : ''}`}>
                                        {name}
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                        {selectedItems?.length > 0 && (
                                            <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                                                {selectedItems.length}
                                            </Badge>
                                        )}
                                        <ChevronDown
                                            size={18}
                                            strokeWidth={1.5}
                                            className={`transition-transform ${open ? 'rotate-180' : ''}`}
                                        />
                                    </div>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                                <p>{name}</p>
                            </TooltipContent>
                        </Tooltip>

                        {/* Inline контент для карты */}
                        <div className={`w-full duration-200 transition-all ${open ? 'block' : 'hidden'} rounded-md border-gray-200 bg-white`}>
                            {/* Header */}
                            <div className="flex items-center justify-between px-4 py-1 pt-2">
                                <span className="text-sm text-gray-700">
                                    {selectedItems?.length || 0} {t('select')}
                                </span>
                                <Button
                                    variant="link"
                                    size="sm"
                                    className="h-auto p-0 text-sm"
                                    onClick={() => (selectedItems?.length || !selectAll)
                                        ? resetItems(selectedItems)
                                        : handleSelectAll()
                                    }
                                >
                                    {(selectedItems?.length || !selectAll) ? t('reset') : t('select_all')}
                                </Button>
                            </div>

                            {/* Search */}
                            <div className="relative mx-2.5 px-1.5">
                                <Search className="absolute left-1.5 top-0 bottom-0 my-auto h-5 w-5 text-zinc-400" />
                                <input
                                    type="text"
                                    value={filterName}
                                    onChange={(e) => setFilterName(e.target.value)}
                                    placeholder={t('search')}
                                    className="w-full pr-4 pl-[32px] py-1 outline-none border-b focus:border-blue-600"
                                />
                            </div>

                            {/* Items list */}
                            {shouldShowItems && (
                                <div className="max-h-[200px] overflow-y-auto px-4 py-2 space-y-2 scroll">
                                    {filteredItems.map(item => {
                                        const itemName = getItemName(item)
                                        if (!itemName) return null

                                        return (
                                            <div
                                                key={`filter-${type || 'item'}-${item.id}`}
                                                className="flex items-center space-x-2"
                                            >
                                                <Checkbox
                                                    id={`filter-${type || 'item'}-${item.id}`}
                                                    checked={selectedItems?.includes(item.id)}
                                                    onCheckedChange={() => addItem(item.id)}
                                                />
                                                <Label
                                                    htmlFor={`filter-${type || 'item'}-${item.id}`}
                                                    className="text-sm font-normal cursor-pointer leading-tight select-none flex-1"
                                                >
                                                    {itemName}
                                                </Label>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    // ДЛЯ ФОРМ - Popover
                    <Popover open={open} onOpenChange={(newOpen) => {
                        // Не закрывать если диалог открыт
                        if (!dialogOpen && !isOpen) {
                            setOpen(newOpen)
                        }
                    }} modal={false}>
                        <PopoverTrigger asChild>
                            <div className="w-full">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            type='button'
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={open}
                                            className="hover:bg-background w-full justify-between h-[40px] font-medium"
                                        >
                                            <span className="text-base overflow-hidden whitespace-nowrap text-ellipsis">
                                                {name}
                                            </span>
                                            <div className="flex items-center gap-1.5">
                                                {selectedItems?.length > 0 && (
                                                    <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                                                        {selectedItems.length}
                                                    </Badge>
                                                )}
                                                <ChevronDown
                                                    size={18}
                                                    strokeWidth={1.5}
                                                    className={`transition-transform ${open ? 'rotate-180' : ''}`}
                                                />
                                            </div>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                        <p>{name}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        </PopoverTrigger>

                        <PopoverContent
                            className="w-[var(--radix-popover-trigger-width)] p-0"
                            align="start"
                            sideOffset={4}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-3 py-2 border-b">
                                <span className="text-sm text-gray-700">
                                    {selectedItems?.length || 0} {t('select')}
                                </span>
                                <Button
                                    variant="link"
                                    size="sm"
                                    className="h-auto p-0 text-sm"
                                    onClick={() => (selectedItems?.length || !selectAll)
                                        ? resetItems(selectedItems)
                                        : handleSelectAll()
                                    }
                                >
                                    {(selectedItems?.length || !selectAll) ? t('reset') : t('select_all')}
                                </Button>
                            </div>

                            {/* Search */}
                            <div className="relative px-3 py-2">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input2
                                    value={filterName}
                                    onChange={(e) => setFilterName(e.target.value)}
                                    placeholder={t('search')}
                                    className="pl-8 h-9 outline-none border focus:border-blue-600"
                                />
                            </div>

                            {/* Items list */}
                            {shouldShowItems && (
                                <div className="max-h-[200px] overflow-y-auto px-3 py-2 space-y-2 scroll">
                                    {filteredItems.map(item => {
                                        const itemName = getItemName(item)
                                        if (!itemName) return null

                                        return (
                                            <div
                                                key={`filter-${type || 'item'}-${item.id}`}
                                                className="flex items-center justify-between group"
                                            >
                                                <div className="flex items-center space-x-2 flex-1 min-w-0">
                                                    <Checkbox
                                                        id={`filter-${type || 'item'}-${item.id}`}
                                                        checked={selectedItems?.includes(item.id)}
                                                        onCheckedChange={() => addItem(item.id)}
                                                        className=""
                                                    />
                                                    <Label
                                                        htmlFor={`filter-${type || 'item'}-${item.id}`}
                                                        className="text-sm font-normal cursor-pointer leading-tight select-none flex-1 min-w-0"
                                                    >
                                                        {itemName}
                                                    </Label>
                                                </div>

                                                {showCanEdit && (
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-4 w-4 hover:bg-transparent"
                                                            onClick={(e) => handleEditTag(e, {
                                                                id: item.id,
                                                                nameEng: item.nameEng,
                                                                nameRu: item.nameRu
                                                            })}
                                                        >
                                                            <Pencil className="h-3.5 w-3.5" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-4 w-4 text-red-600 hover:text-red-700 hover:bg-transparent"
                                                            onClick={(e) => handleDeleteTag(e, item.id)}
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            )}

                            {/* Add tag button */}
                            {showCanEdit && (
                                <>
                                    <Separator />
                                    <div className="p-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-sm w-full justify-start text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                            onClick={handleAddTag}
                                        >
                                            <span className="text-xl -translate-y-[1px]">+</span>
                                            {t('add_tag')}
                                        </Button>
                                    </div>
                                </>
                            )}
                        </PopoverContent>
                    </Popover>)}

                {/* Selected items badges */}
                {(pathNames.includes('create') || pathNames.includes('edit')) && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                        {selectedItems?.map(selectedId => {
                            const item = items.find(i => i.id === selectedId)
                            if (!item) return null

                            const itemName = getItemName(item)
                            if (!itemName) return null

                            return (
                                <Badge
                                    key={selectedId}
                                    variant="outline"
                                    className="px-2 gap-2 text-sm border-zinc-300"
                                >
                                    <span className="max-w-[200px] truncate">{itemName}</span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="p-0 pt-[3px] w-[10px] h-[10px]  hover:bg-transparent"
                                        onClick={() => addItem(selectedId)}
                                    >
                                        <span className="sr-only">Remove</span>
                                        <svg className="w-[10px] h-[10px]" viewBox="0 0 24 24" fill="none">
                                            <path
                                                d="M18 6L6 18M6 6l12 12"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                    </Button>
                                </Badge>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Tag Dialog */}
            {dialogOpen && (
                <div className='tag-form fixed top-0 left-0 z-[60] overflow-y-auto w-screen h-screen bg-black/30'
                    onClick={(e) => {
                        // Закрывать только при клике на backdrop
                        if (e.target === e.currentTarget) {
                            setDialogOpen(false)
                        }
                    }}>
                    <div className='flex items-center h-full justify-center px-4 pt-4 pb-20 lg:ml-[290px] text-center'
                        onClick={(e) => e.stopPropagation()}>
                        <div className='relative inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:w-full sm:max-w-md sm:p-6 sm:align-middle'>
                            <h3
                                className='text-center text-lg font-medium leading-6 text-gray-800 capitalize'
                                id='modal-title'
                            >
                                {dialogMode === 'create' ? t('new_tag') : t('edit_tag')}
                            </h3>
                            <ul className='my-2 space-y-3'>
                                <div>
                                    <label className='font-medium'>{t('name')}</label>
                                    <input
                                        name='nameRu'
                                        onChange={e =>
                                            setTagData(prev => ({ ...prev, nameRu: e.target.value }))
                                        }
                                        value={tagData.nameRu || ''}
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
                                        value={tagData.nameEng || ''}
                                        type='text'
                                        className='bg-white w-full mt-1 p-2 outline-none border focus:border-blue-600 shadow-sm rounded-md'
                                    />
                                </div>
                            </ul>
                            <div className='mt-8'>
                                <div className='mt-4 sm:flex sm:items-center sm:-mx-2'>
                                    <button
                                        onClick={() => setDialogOpen(false)}
                                        className='w-full px-4 py-2 font-medium tracking-wide text-gray-700 capitalize transition-colors duration-300 transform border border-gray-200 rounded-md sm:w-1/2 sm:mx-2 focus:outline-none'
                                    >
                                        {t('cancel')}
                                    </button>
                                    <button
                                        onClick={handleSaveTag}
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
            )}
        </div>
    )
})

export default Filter