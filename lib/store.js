import { configureStore } from '@reduxjs/toolkit'

export const store = configureStore({
    reducer: {
        placeholder: (state = {}) => state
    },
})
