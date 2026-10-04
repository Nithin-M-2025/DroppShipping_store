import {createSlice} from '@reduxjs/toolkit'

const STORAGE_KEY = 'store_cart'

const getStoredCart = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        return stored ? JSON.parse(stored) : []
    } catch (error) {
        return []
    }
}

const saveToStorage = items => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch (error) {
        console.log(error)
    }
}

const initialState = {
    items: getStoredCart(),
}

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action) => {
            const item = action.payload
            const cartKey = `${item.id}-${item.variantId || 'default'}`
            const existing = state.items.find(each => each.cartKey === cartKey)

            if (existing) {
                existing.quantity += 1
            } else {
                state.items.push({...item, cartKey, quantity: 1})
            }

            saveToStorage(state.items)
        },

        increaseQuantity: (state, action) => {
            const cartKey = action.payload
            const item = state.items.find(each => each.cartKey === cartKey)
            if (item) item.quantity += 1

            saveToStorage(state.items)
        },

        decreaseQuantity: (state, action) => {
            const cartKey = action.payload
            const item = state.items.find(each => each.cartKey === cartKey)

            if (item) {
                item.quantity -= 1
                if (item.quantity <= 0) {
                    state.items = state.items.filter(
                        each => each.cartKey !== cartKey,
                    )
                }
            }

            saveToStorage(state.items)
        },

        removeFromCart: (state, action) => {
            const cartKey = action.payload
            state.items = state.items.filter(each => each.cartKey !== cartKey)

            saveToStorage(state.items)
        },

        clearCart: state => {
            state.items = []
            saveToStorage(state.items)
        },
    },
})

export const {
    addToCart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
} = cartSlice.actions

export const selectCartItems = state => state.cart.items

export const selectTotalItems = state =>
    state.cart.items.reduce((sum, each) => sum + each.quantity, 0)

export const selectTotalPrice = state =>
    state.cart.items.reduce(
        (sum, each) => sum + Number(each.price) * each.quantity,
        0,
    )

export default cartSlice.reducer