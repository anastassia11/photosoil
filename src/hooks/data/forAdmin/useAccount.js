import { useQuery } from '@tanstack/react-query'
import { useParams, useSearchParams } from 'next/navigation'
import { getTranslation } from '@/i18n/client'
import { getAccount } from '@/api/account/get_account'
import { useSnapshot } from 'valtio'
import { adminSortsStore } from '@/store/valtioStore/adminSortsStore'

export default function useAccount(id) {
    const searchParams = useSearchParams()
    const { sortBy, sortType } = useSnapshot(adminSortsStore)
    const { locale } = useParams()
    const { t } = getTranslation(locale)

    const FILTERS = [
        { title: t('soils'), name: 'objects' },
        { title: t('ecosystems'), name: 'ecosystems' },
        { title: t('publications'), name: 'publications' },
        { title: t('news'), name: 'news' }
    ]

    const { data: account = {}, isLoading: accountIsLoading } = useQuery({
        queryKey: ['admin account', id],
        queryFn: () => getAccount(id),
        select: res => {
            let data = { ...res.data }

            const filterName = searchParams.get('search')
            const currentLang = searchParams.get('lang')
            const publishStatus = searchParams.get('publish')

            const disabledTypes = searchParams.get('disabled')

            let userObjects = [
                ...data.soilObjects.flatMap(({ translations }) =>
                    translations.map(translation => ({
                        ...translation,
                        type: FILTERS.find(({ name }) => name === 'objects')
                    }))
                ),
                ...data.ecoSystems.flatMap(({ translations }) =>
                    translations.map(translation => ({
                        ...translation,
                        type: FILTERS.find(({ name }) => name === 'ecosystems')
                    }))
                ),
                ...data.publications.flatMap(({ translations }) =>
                    translations.map(translation => ({
                        ...translation,
                        type: FILTERS.find(({ name }) => name === 'publications')
                    }))
                ),
                ...data.news.flatMap(({ translations }) =>
                    translations.map(translation => ({
                        ...translation,
                        type: FILTERS.find(({ name }) => name === 'news')
                    }))
                )
            ].filter(obj => {
                const matchesSearch = !filterName || (
                    obj.name?.toLowerCase().includes(filterName.toLowerCase()) ||
                    obj.code?.toLowerCase().includes(filterName.toLowerCase()) ||
                    obj.title?.toLowerCase().includes(filterName.toLowerCase())
                )

                const matchesLang = !currentLang ||
                    (currentLang == 'ru' && !obj.isEnglish) || (currentLang == 'en' && obj.isEnglish)

                const matchesPublish = !publishStatus ||
                    (publishStatus == 0 && !obj.isVisible) || (publishStatus == 1 && obj.isVisible)

                const matchesTypes = !disabledTypes || !disabledTypes.includes(obj.type?.name)

                return matchesSearch &&
                    matchesTypes &&
                    matchesLang &&
                    matchesPublish
            }).sort((a, b) => {
                let fieldA, fieldB

                if (sortBy === 'name') {
                    fieldA = a[sortBy]?.toString()
                    fieldB = b[sortBy]?.toString()
                } else if (sortBy === 'creator') {
                    fieldA = a.userInfo?.email
                    fieldB = b.userInfo?.email
                } else {
                    fieldA = a[sortBy]
                    fieldB = b[sortBy]
                }

                if (sortBy === 'lastUpdated') {
                    return sortType == 1 ? fieldA - fieldB : fieldB - fieldA
                } else if (sortBy === 'isVisible') {
                    return fieldA === fieldB
                        ? 0
                        : sortType == 1
                            ? fieldA
                                ? 1
                                : -1
                            : fieldA
                                ? -1
                                : 1
                } else {
                    return sortType == 1
                        ? fieldA?.toString()?.localeCompare(fieldB)
                        : fieldB?.toString()?.localeCompare(fieldA)
                }

            })

            return { ...data, userObjects }
        }
    })

    return {
        account, accountIsLoading
    }
}
