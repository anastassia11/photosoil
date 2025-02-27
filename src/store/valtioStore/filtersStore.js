import { proxy } from 'valtio'

export const filtersStore = proxy({
    selectedTags: [],
    selectedAuthors: [],
    selectedTerms: [],
    selectedCategories: [],
    selectedEcosystems: [],
    selectedPublications: [],
})