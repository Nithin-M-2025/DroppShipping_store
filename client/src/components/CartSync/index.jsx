import {useEffect} from 'react'
import {useSelector} from 'react-redux'

const API_URL = 'http://localhost:3000'

const CartSync = () => {
    const items = useSelector(state => state.cart.items)

    useEffect(() => {
        const token = localStorage.getItem('jwt_token')
        if (!token) return

        const timer = setTimeout(() => {
            fetch(`${API_URL}/cart/sync`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({items}),
            }).catch(console.log)
        }, 1500)

        return () => clearTimeout(timer)
    }, [items])

    return null
}

export default CartSync