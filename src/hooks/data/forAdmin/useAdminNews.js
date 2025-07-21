import { deleteNewsById } from '@/api/news/delete_news'
import { getNewsForAdmin } from '@/api/news/get_news_forAdmin'
import { putNewsVisible } from '@/api/news/put_newsVisible'
import { adminSortsStore } from '@/store/valtioStore/adminSortsStore'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import { useSnapshot } from 'valtio'

export default function useAdminNews() {
    const queryClient = useQueryClient()
    const searchParams = useSearchParams()
    const { sortBy, sortType } = useSnapshot(adminSortsStore)

    const { data: news = [], isLoading: newsIsLoading } = useQuery({
        queryKey: ['admin news'],
        queryFn: getNewsForAdmin,
        select: res => {
            let data = [...res.data]

            const filterName = searchParams.get('search')
            const currentLang = searchParams.get('lang')
            const publishStatus = searchParams.get('publish')

            data = data.filter(item => {
                const matchesSearch = !filterName || (
                    item?.title.toLowerCase().includes(filterName.toLowerCase())
                )
                const matchesLang = !currentLang ||
                    (currentLang == 'ru' && !item.isEnglish) || (currentLang == 'en' && item.isEnglish)

                const matchesPublish = !publishStatus ||
                    (publishStatus == 0 && !item.isVisible) || (publishStatus == 1 && item.isVisible)

                return matchesSearch
                    && matchesLang
                    && matchesPublish
            }).sort((a, b) => {
                let fieldA, fieldB

                if (sortBy === 'creator') {
                    fieldA = a.userInfo?.email
                    fieldB = b.userInfo?.email
                } else {
                    fieldA = a[sortBy]
                    fieldB = b[sortBy]
                }

                if (sortBy === 'lastUpdated') {
                    return sortType == 1 ? fieldB - fieldA : fieldA - fieldB
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

            return data
        }
    })

    const { mutate: deleteNews, isPending: deleteIsPending } = useMutation({
        mutationKey: ['delete news'],
        mutationFn: deleteNewsById,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin news'] })
            queryClient.invalidateQueries({
                queryKey: ['admin account'],
                exact: false
            })
        }
    })

    const { mutate: visibleChange, isPending: visibleIsPending } = useMutation({
        mutationKey: ['visible news'],
        mutationFn: ({ id, isVisible }) => putNewsVisible(id, { isVisible }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin news'] })
            queryClient.invalidateQueries({
                queryKey: ['admin account'],
                exact: false
            })
        }
    })

    return {
        news, newsIsLoading,
        deleteNews, deleteIsPending,
        visibleChange, visibleIsPending
    }
}
