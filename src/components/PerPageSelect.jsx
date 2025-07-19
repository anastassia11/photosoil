import { PAGINATION_DATA, PAGINATION_OPTIONS } from '@/utils/constants'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { useParams, usePathname } from 'next/navigation'
import { getTranslation } from '@/i18n/client'
import { useEffect } from 'react'

export default function PerPageSelect({ itemsPerPage, setItemsPerPage, isChild = false, type }) {
    const { locale } = useParams()
    const { t } = getTranslation(locale)
    const pathname = usePathname()

    useEffect(() => {
        if (itemsPerPage == undefined || itemsPerPage == null) return
        const defaultData = JSON.parse(localStorage.getItem('itemsPerPage')) ?? PAGINATION_DATA
        if (!isChild) {
            localStorage.setItem('itemsPerPage', JSON.stringify({ ...defaultData, [type]: { ...defaultData[type], num: itemsPerPage } }))
        } else {
            const _pathname = pathname.split('/')[2]
            localStorage.setItem('itemsPerPage', JSON.stringify({
                ...defaultData, [_pathname]: {
                    ...defaultData[_pathname],
                    children: {
                        ...defaultData[_pathname].children,
                        [type]: itemsPerPage
                    }
                }
            }))
        }
    }, [itemsPerPage])

    return (
        <div className='self-end flex flex-row items-center justify-end w-[190px] space-x-2'>
            <Label htmlFor="in_page"
                className='text-base min-w-fit'>{t('in_page')}</Label>
            <Select
                id="in_page"
                value={itemsPerPage?.toString() ?? '0'}
                onValueChange={(value) => setItemsPerPage(Number(value))}>
                <SelectTrigger className="text-base w-[70px]">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent className='min-w-0'>
                    {Object.entries(PAGINATION_OPTIONS).map(([value, title]) =>
                        <SelectItem key={value} value={value.toString()}
                            className='text-base'>{title}</SelectItem>)}
                </SelectContent>
            </Select>
        </div>
    )
}
