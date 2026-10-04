import {useState} from 'react'
import {Link} from 'react-router'
import {useSelector, useDispatch} from 'react-redux'
import {useRazorpay} from 'react-razorpay'
import {Minus, Plus, Trash2, ShoppingBag} from 'lucide-react'

import {
    selectCartItems,
    selectTotalItems,
    selectTotalPrice,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
} from '../../store/cartSlice'

import './index.css'

const formatPrice = value => `$${Number(value).toFixed(2)}`

const Cart = () => {
    const dispatch = useDispatch()
    const {Razorpay} = useRazorpay()

    const cartItems = useSelector(selectCartItems)
    const totalItems = useSelector(selectTotalItems)
    const totalPrice = useSelector(selectTotalPrice)

    const [isCheckingOut, setIsCheckingOut] = useState(false)
    const [checkoutError, setCheckoutError] = useState('')

    const handleCheckout = async () => {
        setCheckoutError('')
        setIsCheckingOut(true)

        try {
            // Send item ids + quantities only — backend recalculates the real price
            const orderPayload = {
                cartItems: cartItems.map(item => ({
                    id: item.id,
                    variantId: item.variantId,
                    quantity: item.quantity,
                })),
            }

            const orderResponse = await fetch('http://localhost:3000/create-order', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(orderPayload),
            })

            if (!orderResponse.ok) {
                throw new Error('Could not create order')
            }

            const order = await orderResponse.json()

            const options = {
                key: 'rzp_test_xxxxxxxxxxxx', // replace with your real Key Id
                amount: order.amount,
                currency: order.currency,
                name: 'Store',
                description: `Order for ${totalItems} item${totalItems === 1 ? '' : 's'}`,
                order_id: order.id,
                handler: async response => {
                    try {
                        const verifyResponse = await fetch(
                            'http://localhost:3000/verify-payment',
                            {
                                method: 'POST',
                                headers: {'Content-Type': 'application/json'},
                                body: JSON.stringify(response),
                            },
                        )

                        const verifyData = await verifyResponse.json()

                        if (verifyData.success) {
                            dispatch(clearCart())
                        } else {
                            setCheckoutError(
                                'Payment could not be verified. Please contact support.',
                            )
                        }
                    } catch (error) {
                        setCheckoutError('Something went wrong verifying your payment.')
                    } finally {
                        setIsCheckingOut(false)
                    }
                },
                modal: {
                    ondismiss: () => setIsCheckingOut(false),
                },
                prefill: {
                    name: '',
                    email: '',
                    contact: '',
                },
                theme: {
                    color: '#222222',
                },
            }

            const razorpayInstance = new Razorpay(options)
            razorpayInstance.open()
        } catch (error) {
            setCheckoutError('Could not start checkout. Please try again.')
            setIsCheckingOut(false)
        }
    }

    const renderEmptyCart = () => (
        <div className="crt_empty">
            <div className="crt_empty_icon">
                <ShoppingBag size={30} />
            </div>
            <h2 className="crt_empty_title">Your cart is empty</h2>
            <p className="crt_empty_text">
                Looks like you haven't added anything yet.
            </p>
            <Link to="/" className="crt_button">
                Continue shopping
            </Link>
        </div>
    )

    const renderCartItems = () => (
        <div className="crt_layout">
            <ul className="crt_list">
                {cartItems.map(item => (
                    <li className="crt_item" key={item.cartKey}>
                        <Link to={`/products/${item.id}`} className="crt_image_link">
                            {item.image ? (
                                <img
                                    className="crt_image"
                                    src={item.image}
                                    alt={item.title}
                                />
                            ) : (
                                <div className="crt_image crt_image_placeholder">
                                    No image
                                </div>
                            )}
                        </Link>

                        <div className="crt_details">
                            <h3 className="crt_item_title">{item.title}</h3>

                            {item.variantTitle &&
                                item.variantTitle !== 'Default Title' && (
                                    <p className="crt_item_variant">
                                        {item.variantTitle}
                                    </p>
                                )}

                            <p className="crt_item_price">
                                {formatPrice(item.price)}
                            </p>

                            <div className="crt_quantity">
                                <button
                                    type="button"
                                    className="crt_qty_button"
                                    onClick={() =>
                                        dispatch(decreaseQuantity(item.cartKey))
                                    }
                                    aria-label="Decrease quantity"
                                >
                                    <Minus size={14} />
                                </button>

                                <span className="crt_qty_value">
                                    {item.quantity}
                                </span>

                                <button
                                    type="button"
                                    className="crt_qty_button"
                                    onClick={() =>
                                        dispatch(increaseQuantity(item.cartKey))
                                    }
                                    aria-label="Increase quantity"
                                >
                                    <Plus size={14} />
                                </button>
                            </div>
                        </div>

                        <div className="crt_item_side">
                            <p className="crt_line_total">
                                {formatPrice(Number(item.price) * item.quantity)}
                            </p>

                            <button
                                type="button"
                                className="crt_remove"
                                onClick={() =>
                                    dispatch(removeFromCart(item.cartKey))
                                }
                                aria-label={`Remove ${item.title}`}
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </li>
                ))}
            </ul>

            <aside className="crt_summary">
                <h2 className="crt_summary_heading">Order summary</h2>

                <div className="crt_summary_row">
                    <span className="crt_summary_label">Items</span>
                    <span>{totalItems}</span>
                </div>

                <div className="crt_summary_row">
                    <span className="crt_summary_label">Subtotal</span>
                    <span>{formatPrice(totalPrice)}</span>
                </div>

                <div className="crt_summary_row">
                    <span className="crt_summary_label">Shipping</span>
                    <span>Calculated at checkout</span>
                </div>

                <div className="crt_summary_row crt_summary_total">
                    <span>Total</span>
                    <span>{formatPrice(totalPrice)}</span>
                </div>

                {checkoutError && (
                    <p className="crt_checkout_error">{checkoutError}</p>
                )}

                <button
                    type="button"
                    className="crt_button crt_checkout"
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                >
                    {isCheckingOut ? 'Processing...' : 'Checkout'}
                </button>

                <button
                    type="button"
                    className="crt_clear"
                    onClick={() => dispatch(clearCart())}
                >
                    Clear cart
                </button>
            </aside>
        </div>
    )

    return (
        <div className="crt_page">
            <div className="crt_container">
                <h1 className="crt_title">
                    Your Cart
                    {totalItems > 0 && (
                        <span className="crt_count">
                            {totalItems} {totalItems === 1 ? 'item' : 'items'}
                        </span>
                    )}
                </h1>

                {cartItems.length === 0 ? renderEmptyCart() : renderCartItems()}
            </div>
        </div>
    )
}

export default Cart