import { deleteEcosystemById } from '@/api/ecosystem/delete_ecosystem'
import { getEcosystemsForAdmin } from '@/api/ecosystem/get_ecosystems_forAdmin'
import { putEcosystemVisible } from '@/api/ecosystem/put_ecosystemVisible'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'

export default function useAdminEcosystems() {
    const queryClient = useQueryClient()
    const searchParams = useSearchParams()

    const { data: ecosystems = [], isLoading: ecosystemsIsLoading } = useQuery({
        queryKey: ['admin ecosystems'],
        queryFn: getEcosystemsForAdmin,
        select: res => {
            let data = [...res.data]

            const filterName = searchParams.get('search')
            const currentLang = searchParams.get('lang')
            const publishStatus = searchParams.get('publish')
            const sortBy = searchParams.get('sortBy')

            // 1 = по возрастанию 
            // 0 = по убыванию
            const sortType = searchParams.get('sortType')

            data = data.filter(ecosystem => {

                const matchesSearch = !filterName || (
                    ecosystem?.name.toLowerCase().includes(filterName.toLowerCase()) ||
                    ecosystem?.code?.toLowerCase().includes(filterName.toLowerCase())
                )
                const matchesLang = !currentLang ||
                    (currentLang == 'ru' && !ecosystem.isEnglish) || (currentLang == 'en' && ecosystem.isEnglish)

                const matchesPublish = !publishStatus ||
                    (publishStatus == 0 && !ecosystem.isVisible) || (publishStatus == 1 && ecosystem.isVisible)

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

            return data
        }
    })

    const { mutate: deleteEcosystem, isPending: deleteIsPending } = useMutation({
        mutationKey: ['delete ecosystem'],
        mutationFn: deleteEcosystemById,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin ecosystems'] })
            queryClient.invalidateQueries({
                queryKey: ['admin account'],
                exact: false
            })
        }
    })

    const { mutate: visibleChange, isPending: visibleIsPending } = useMutation({
        mutationKey: ['visible ecosystem'],
        mutationFn: ({ id, isVisible }) => putEcosystemVisible(id, { isVisible }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin ecosystems'] })
            queryClient.invalidateQueries({
                queryKey: ['admin account'],
                exact: false
            })
        }
    })

    return {
        ecosystems, ecosystemsIsLoading,
        deleteEcosystem, deleteIsPending,
        visibleChange, visibleIsPending
    }
}
