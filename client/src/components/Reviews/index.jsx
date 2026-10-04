import {useState, useEffect, useCallback} from 'react'
import {BeatLoader} from 'react-spinners'

import './index.css'

const API_URL = 'http://localhost:3000'

const formatDate = dateString =>
    dateString
        ? new Date(dateString).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
          })
        : ''

const Stars = ({value}) => (
    <span className="rv_stars" aria-label={`${value} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map(star => (
            <span
                key={star}
                className={star <= Math.round(value) ? 'rv_star_filled' : 'rv_star_empty'}
            >
                ★
            </span>
        ))}
    </span>
)

const Reviews = ({productId, productType}) => {
    const [reviews, setReviews] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    const [name, setName] = useState('')
    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [comment, setComment] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')

    const getReviews = useCallback(async () => {
        setIsLoading(true)

        try {
            const response = await fetch(
                `${API_URL}/reviews/${productType}/${productId}`,
            )

            if (response.ok) {
                const data = await response.json()
                setReviews(data)
            } else {
                setReviews([])
            }
        } catch (err) {
            console.log(err)
            setReviews([])
        } finally {
            setIsLoading(false)
        }
    }, [productId, productType])

    useEffect(() => {
        getReviews()
    }, [getReviews])

    const handleSubmit = async event => {
        event.preventDefault()
        setError('')

        if (!name.trim() || !comment.trim() || rating === 0) {
            setError('Please add your name, a rating and a comment.')
            return
        }

        setIsSubmitting(true)

        try {
            const response = await fetch(`${API_URL}/reviews`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    product_type: productType,
                    product_id: String(productId),
                    name: name.trim(),
                    rating,
                    comment: comment.trim(),
                }),
            })

            if (response.ok) {
                setName('')
                setComment('')
                setRating(0)
                await getReviews()
            } else {
                setError('Could not submit your review. Please try again.')
            }
        } catch (err) {
            console.log(err)
            setError('Something went wrong. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const averageRating = reviews.length
        ? reviews.reduce((sum, review) => sum + Number(review.rating), 0) /
          reviews.length
        : 0

    const renderReviewsList = () => {
        if (isLoading) {
            return (
                <div className="rv_loader">
                    <BeatLoader color="#000" size={8} />
                </div>
            )
        }

        if (reviews.length === 0) {
            return (
                <p className="rv_empty">
                    No reviews yet. Be the first to share your thoughts.
                </p>
            )
        }

        return (
            <ul className="rv_list">
                {reviews.map(review => (
                    <li className="rv_item" key={review.id}>
                        <div className="rv_item_top">
                            <span className="rv_avatar">
                                {review.name.charAt(0).toUpperCase()}
                            </span>
                            <div className="rv_item_meta">
                                <p className="rv_item_name">{review.name}</p>
                                <p className="rv_item_date">
                                    {formatDate(review.created_at)}
                                </p>
                            </div>
                            <Stars value={Number(review.rating)} />
                        </div>
                        <p className="rv_item_comment">{review.comment}</p>
                    </li>
                ))}
            </ul>
        )
    }

    return (
        <section className="rv_section">
            <div className="rv_header">
                <h2 className="rv_heading">Customer Reviews</h2>

                {reviews.length > 0 && (
                    <div className="rv_summary">
                        <span className="rv_average">{averageRating.toFixed(1)}</span>
                        <Stars value={averageRating} />
                        <span className="rv_count">
                            {reviews.length} review{reviews.length > 1 ? 's' : ''}
                        </span>
                    </div>
                )}
            </div>

            <div className="rv_body">
                <form className="rv_form" onSubmit={handleSubmit}>
                    <h3 className="rv_form_title">Write a review</h3>

                    <div
                        className="rv_rating_input"
                        onMouseLeave={() => setHoverRating(0)}
                    >
                        {[1, 2, 3, 4, 5].map(star => (
                            <button
                                key={star}
                                type="button"
                                className={`rv_star_button ${
                                    star <= (hoverRating || rating)
                                        ? 'rv_star_button_active'
                                        : ''
                                }`}
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                            >
                                ★
                            </button>
                        ))}
                    </div>

                    <input
                        className="rv_input"
                        type="text"
                        placeholder="Your name"
                        value={name}
                        maxLength={100}
                        onChange={event => setName(event.target.value)}
                    />

                    <textarea
                        className="rv_textarea"
                        placeholder="Share your experience with this product"
                        rows={4}
                        value={comment}
                        onChange={event => setComment(event.target.value)}
                    />

                    {error && <p className="rv_error">{error}</p>}

                    <button
                        type="submit"
                        className="rv_submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit review'}
                    </button>
                </form>

                <div className="rv_list_wrapper">{renderReviewsList()}</div>
            </div>
        </section>
    )
}

export default Reviews