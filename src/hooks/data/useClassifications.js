import { getClassifications } from '@/api/classification/get_classifications'
import { useQuery } from '@tanstack/react-query'

export default function useClassifications() {
    const { data: classifications, isLoading: classificationsIsLoading } = useQuery({
        queryKey: ['classifications'],
        queryFn: getClassifications,
        select: res => res.data.sort((a, b) => a.order - b.order)
    })

    return {
        classifications, classificationsIsLoading
    }
}
