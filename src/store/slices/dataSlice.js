import { getClassifications } from '@/api/classification/get_classifications';
import { getSoils } from '@/api/soil/get_soils';
import { getTags } from '@/api/tags/get_tags';
import { BASE_SERVER_URL } from '@/utils/constants';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios';

export const getAllClassifications = createAsyncThunk(
    'data/getAllClassifications',
    async function () {
        const result = await getClassifications();
        if (result.success) {
            return result.data;
        }
    }
);

export const getAllTags = createAsyncThunk(
    'data/getAllTags',
    async function () {
        const result = await getTags();
        if (result.success) {
            return result.data;
        }
    }
);

const dataSlice = createSlice({
    name: 'data',
    initialState: {
        classifications: [],
        tags: [],
        selectedTags: [],
        selectedAuthors: [],
        selectedTerms: [],
        selectedCategories: [],
        selectedEcosystems: [],
        selectedPublications: [],
        status: null,
    },

    reducers: {
        // Term reducers
        addTerm(state, action) {
            const existingId = state.selectedTerms.find(id => id === action.payload);
            if (!existingId) {
                state.selectedTerms.push(action.payload);
            }
        },
        deleteTerm(state, action) {
            state.selectedTerms = state.selectedTerms.filter(item => item !== action.payload)
        },
        resetTerm(state) {
            state.selectedTerms = []
        },

        // Category reducers
        addCategory(state, action) {
            const existingId = state.selectedCategories.find(id => id === action.payload);
            if (!existingId) {
                state.selectedCategories.push(action.payload);
            }
        },
        deleteCategory(state, action) {
            state.selectedCategories = state.selectedCategories.filter(item => item !== action.payload)
        },
        resetCategory(state) {
            state.selectedCategories = []
        },
        // Tags reducers
        addTag(state, action) {
            const existingId = state.selectedTags.find(id => id === action.payload);
            if (!existingId) {
                state.selectedTags.push(action.payload);
            }
        },
        deleteTag(state, action) {
            state.selectedTags = state.selectedTags.filter(item => item !== action.payload)
        },
        resetTags(state) {
            state.selectedTags = []
        },

        // Author reducers
        addAuthor(state, action) {
            const existingId = state.selectedAuthors.find(id => id === action.payload);
            if (!existingId) {
                state.selectedAuthors.push(action.payload);
            }
        },
        deleteAuthor(state, action) {
            state.selectedAuthors = state.selectedAuthors.filter(item => item !== action.payload)
        },
        resetAuthor(state) {
            state.selectedAuthors = []
        },

        // Ecosystem reducers
        addEcosystem(state, action) {
            const existingId = state.selectedEcosystems.find(id => id === action.payload);
            if (!existingId) {
                state.selectedEcosystems.push(action.payload);
            }
        },
        deleteEcosystem(state, action) {
            state.selectedEcosystems = state.selectedEcosystems.filter(item => item !== action.payload)
        },
        resetEcosystem(state) {
            state.selectedEcosystems = []
        },

        // Publication reducers
        addPublication(state, action) {
            state.selectedPublications.push(action.payload)
        },
        deletePublication(state, action) {
            state.selectedPublications = state.selectedPublications.filter(item => item !== action.payload)
        },
        resetPublication(state) {
            state.selectedPublications = []
        },
    },
    extraReducers: builder => {
        builder
            .addCase(getAllClassifications.pending, (state) => {
                state.status = 'loading'
            })
            .addCase(getAllClassifications.fulfilled, (state, action) => {
                state.status = 'resolved';
                state.classifications = action.payload;
            })
            .addCase(getAllClassifications.rejected, (state, action) => { })
            .addCase(getAllTags.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(getAllTags.fulfilled, (state, action) => {
                state.status = 'resolved';
                state.tags = action.payload;
            })
            .addCase(getAllTags.rejected, (state, action) => {
                state.status = 'error';
            });
    },

})
export const {
    addTerm, deleteTerm, resetTerm,
    addCategory, deleteCategory, resetCategory,
    addAuthor, deleteAuthor, resetAuthor,
    addEcosystem, deleteEcosystem, resetEcosystem,
    addPublication, deletePublication, resetPublication,
    addTag, deleteTag, resetTags,
} = dataSlice.actions;
export default dataSlice.reducer