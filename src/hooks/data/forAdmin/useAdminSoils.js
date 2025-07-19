import { deleteSoilById } from '@/api/soil/delete_soil'
import { getSoilsForAdmin } from '@/api/soil/get_soils_forAdmin'
import { putSoilVisible } from '@/api/soil/put_soilVisible'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'

export default function useAdminSoils() {
    const queryClient = useQueryClient()
    const searchParams = useSearchParams()

    const { data: soils = [], isLoading: soilsIsLoading } = useQuery({
        queryKey: ['admin soils'],
        queryFn: getSoilsForAdmin,
        select: res => {
            let data = [...res.data]

            const filterName = searchParams.get('search')
            const currentLang = searchParams.get('lang')
            const publishStatus = searchParams.get('publish')
            const sortBy = searchParams.get('sortBy')

            // 1 = по возрастанию 
            // 0 = по убыванию
            const sortType = searchParams.get('sortType')

            data = data.filter(soil => {

                const matchesSearch = !filterName || (
                    soil?.name.toLowerCase().includes(filterName.toLowerCase()) ||
                    soil?.code?.toLowerCase().includes(filterName.toLowerCase())
                )
                const matchesLang = !currentLang ||
                    (currentLang == 'ru' && !soil.isEnglish) || (currentLang == 'en' && soil.isEnglish)

                const matchesPublish = !publishStatus ||
                    (publishStatus == 0 && !soil.isVisible) || (publishStatus == 1 && soil.isVisible)

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

    const { mutate: deleteSoil, isPending: deleteIsPending } = useMutation({
        mutationKey: ['delete soil'],
        mutationFn: deleteSoilById,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin soils'] })
            queryClient.invalidateQueries({
                queryKey: ['admin account'],
                exact: false
            })
        }
    })

    const { mutate: visibleChange, isPending: visibleIsPending } = useMutation({
        mutationKey: ['visible soil'],
        mutationFn: ({ id, isVisible }) => putSoilVisible(id, { isVisible }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin soils'] })
            queryClient.invalidateQueries({
                queryKey: ['admin account'],
                exact: false
            })
        }
    })

    return {
        soils, soilsIsLoading,
        deleteSoil, deleteIsPending,
        visibleChange, visibleIsPending
    }
}
