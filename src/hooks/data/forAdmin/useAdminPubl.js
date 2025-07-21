import { deletePublicationById } from '@/api/publication/delete_publication'
import { getPublicationsForAdmin } from '@/api/publication/get_publications_forAdmin'
import { putPublicationVisible } from '@/api/publication/put_publicationVisible'
import { adminSortsStore } from '@/store/valtioStore/adminSortsStore'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import { useSnapshot } from 'valtio'

export default function useAdminPubl() {
    const queryClient = useQueryClient()
    const searchParams = useSearchParams()
    const { sortBy, sortType } = useSnapshot(adminSortsStore)

    const { data: publications = [], isLoading: publicationsIsLoading } = useQuery({
        queryKey: ['admin publications'],
        queryFn: getPublicationsForAdmin,
        select: res => {
            let data = [...res.data]

            const filterName = searchParams.get('search')
            const currentLang = searchParams.get('lang')
            const publishStatus = searchParams.get('publish')

            data = data.filter(publ => {
                const matchesSearch = !filterName || (
                    publ?.name.toLowerCase().includes(filterName.toLowerCase())
                )

                const matchesLang = !currentLang ||
                    (currentLang == 'ru' && !publ.isEnglish) || (currentLang == 'en' && publ.isEnglish)

                const matchesPublish = !publishStatus ||
                    (publishStatus == 0 && !publ.isVisible) || (publishStatus == 1 && publ.isVisible)

                return matchesSearch
                    && matchesLang
                    && matchesPublish
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

    const { mutate: deletePubl, isPending: deleteIsPending } = useMutation({
        mutationKey: ['delete publ'],
        mutationFn: deletePublicationById,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin publications'] })
            queryClient.invalidateQueries({
                queryKey: ['admin account'],
                exact: false
            })
        }
    })

    const { mutate: visibleChange, isPending: visibleIsPending } = useMutation({
        mutationKey: ['visible publ'],
        mutationFn: ({ id, isVisible }) => putPublicationVisible(id, { isVisible }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin publications'] })
            queryClient.invalidateQueries({
                queryKey: ['admin account'],
                exact: false
            })
        }
    })

    return {
        publications, publicationsIsLoading,
        deletePubl, deleteIsPending,
        visibleChange, visibleIsPending
    }
}
