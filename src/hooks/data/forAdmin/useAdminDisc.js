import { deleteClassification } from '@/api/classification/delete_classification'
import { getClassifications } from '@/api/classification/get_classifications'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams, useSearchParams } from 'next/navigation'

export default function useAdminDisconaries() {
    const queryClient = useQueryClient()
    const searchParams = useSearchParams()
    const { locale } = useParams()

    const _isEng = locale === 'en'

    const { data: disconaries = [], isLoading: discIsLoading } = useQuery({
        queryKey: ['admin disconaries'],
        queryFn: getClassifications,
        select: res => {
            let data = [...res.data]

            const filterName = searchParams.get('search')
            const sortBy = searchParams.get('sortBy')
            const currentLang = searchParams.get('lang')

            // 1 = по возрастанию 
            // 0 = по убыванию
            const sortType = searchParams.get('sortType')

            data = data.filter(disc => {
                const matchesSearch = !filterName ||
                    disc.nameRu?.toLowerCase().includes(filterName.toLowerCase()) ||
                    disc.nameEng?.toLowerCase().includes(filterName.toLowerCase())

                const matchesLang = !currentLang ||
                    (currentLang == 'ru' && (disc.translationMode == 2 || disc.translationMode == 0)) ||
                    (currentLang == 'en' && (disc.translationMode == 1 || disc.translationMode == 0))

                return matchesSearch
                    && matchesLang
            }).sort((a, b) => {
                let fieldA, fieldB

                if (sortBy === 'name') {
                    fieldA = a[_isEng ? 'nameEng' : 'nameRu']
                    fieldB = b[_isEng ? 'nameEng' : 'nameRu']
                } else {
                    fieldA = a[sortBy]
                    fieldB = b[sortBy]
                }

                return sortType == 1
                    ? fieldA?.toString()?.localeCompare(fieldB)
                    : fieldB?.toString()?.localeCompare(fieldA)
            })

            return data
        }
    })

    const { mutate: fetchDeleteDisc, isPending: deleteIsPending } = useMutation({
        mutationKey: ['delete disc'],
        mutationFn: deleteClassification,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin disconaries'] })
    })

    return {
        disconaries, discIsLoading,
        fetchDeleteDisc, deleteIsPending
    }
}
