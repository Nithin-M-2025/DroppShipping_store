

import {useState, useEffect} from 'react'
import {useParams, useLocation} from 'react-router'
import {useDispatch} from 'react-redux'
import {BeatLoader} from 'react-spinners'
import Reviews from '../../components/Reviews'
import {addToCart} from '../../store/cartSlice'

import './index.css'

const formatDate = dateString =>
    dateString
        ? new Date(dateString).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
          })
        : '-'

const normalizeElectronic = data => ({
    id: data.id,
    title: data.title,
    handle: data.slug,
    vendor: data.category_name,
    product_type: data.category_name,
    body_html: data.description,
    images: [data.image1, data.image2, data.image3]
        .filter(Boolean)
        .map((src, index) => ({id: index, src})),
    options: [],
    variants: [
        {
            id: `electronics-${data.id}`,
            title: 'Default',
            price: data.price,
            compare_at_price: null,
        },
    ],
    created_at: data.created_at,
    updated_at: data.updated_at,
    published_at: null,
})

const ProductDetails = () => {
    const {id} = useParams()
    const {pathname} = useLocation()
    const dispatch = useDispatch()

    const isElectronic = pathname.startsWith('/electronics')

    const [productDetails, setProductDetails] = useState(null)
    const [activeImage, setActiveImage] = useState(0)
    const [isDescriptionOpen, setIsDescriptionOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const getProductDetails = async () => {
            setIsLoading(true)
            setActiveImage(0)

            try {
                const endpoint = isElectronic ? 'electronics' : 'products'
                const url = `http://localhost:3000/${endpoint}/${id}`

                const response = await fetch(url)

                if (response.ok) {
                    const data = await response.json()
                    setProductDetails(
                        isElectronic ? normalizeElectronic(data) : data,
                    )
                } else {
                    setProductDetails(null)
                }
            } catch (error) {
                console.log(error)
                setProductDetails(null)
            } finally {
                setIsLoading(false)
            }
        }

        getProductDetails()
    }, [id, isElectronic])

    const renderProductDetails = () => {
        if (!productDetails) {
            return <h1 className="pd_not_found">Product not found</h1>
        }

        const {
            title,
            handle,
            vendor,
            product_type: productType,
            body_html: bodyHtml,
            images,
            options,
            variants,
            created_at: createdAt,
            updated_at: updatedAt,
            published_at: publishedAt,
        } = productDetails

        const firstVariant = variants?.[0]
        const hasDiscount =
            firstVariant?.compare_at_price &&
            Number(firstVariant.compare_at_price) > Number(firstVariant.price)

        const handleAddToCart = () => {
            dispatch(
                addToCart({
                    id: productDetails.id,
                    title: productDetails.title,
                    image: images?.[0]?.src,
                    price: firstVariant.price,
                    variantId: firstVariant.id,
                    variantTitle: firstVariant.title,
                }),
            )
        }

        return (
            <div className="pd_container">
                <div className="pd_gallery">
                    {images?.length > 0 && (
                        <>
                            <img
                                key={images[activeImage]?.src}
                                className="pd_main_image"
                                src={images[activeImage]?.src}
                                alt={title}
                            />

                            {images.length > 1 && (
                                <ul className="pd_thumbnail_list">
                                    {images.map((image, index) => (
                                        <li key={image.id}>
                                            <img
                                                className={`pd_thumbnail ${
                                                    index === activeImage
                                                        ? 'pd_thumbnail_active'
                                                        : ''
                                                }`}
                                                src={image.src}
                                                alt={`${title} ${index + 1}`}
                                                onClick={() => setActiveImage(index)}
                                            />
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </>
                    )}
                </div>

                <div className="pd_info">
                    <p className="pd_vendor">{vendor}</p>
                    <h1 className="pd_title">{title}</h1>

                    {firstVariant && (
                        <div className="pd_price_row">
                            <span className="pd_price">${firstVariant.price}</span>
                            {hasDiscount && (
                                <span className="pd_compare_price">
                                    ${firstVariant.compare_at_price}
                                </span>
                            )}
                        </div>
                    )}

                    {firstVariant && (
                        <button
                            type="button"
                            className="pd_read_more"
                            onClick={handleAddToCart}
                        >
                            Add to cart
                        </button>
                    )}

                    <ul className="pd_meta_list">
                        <li>
                            <span className="pd_meta_label">
                                {isElectronic ? 'Category' : 'Type'}
                            </span>
                            <span>{productType || '-'}</span>
                        </li>
                        <li>
                            <span className="pd_meta_label">Handle</span>
                            <span>{handle}</span>
                        </li>
                        {!isElectronic && (
                            <li>
                                <span className="pd_meta_label">Published</span>
                                <span>{formatDate(publishedAt)}</span>
                            </li>
                        )}
                        <li>
                            <span className="pd_meta_label">Created</span>
                            <span>{formatDate(createdAt)}</span>
                        </li>
                        <li>
                            <span className="pd_meta_label">Updated</span>
                            <span>{formatDate(updatedAt)}</span>
                        </li>
                    </ul>

                    {options?.length > 0 && (
                        <div className="pd_section">
                            <h2 className="pd_section_heading">Options</h2>
                            {options.map(option => (
                                <div className="pd_option_group" key={option.name}>
                                    <p className="pd_option_name">{option.name}</p>
                                    <ul className="pd_chip_list">
                                        {option.values.map(value => (
                                            <li className="pd_chip" key={value}>
                                                {value}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    )}

                    {bodyHtml && (
                        <div className="pd_description_card">
                            <h2 className="pd_section_heading">Description</h2>

                            <div
                                className={`pd_description_wrapper ${
                                    isDescriptionOpen ? 'pd_description_open' : ''
                                }`}
                            >
                                {isElectronic ? (
                                    <div className="pd_description">
                                        <p>{bodyHtml}</p>
                                    </div>
                                ) : (
                                    <div
                                        className="pd_description"
                                        dangerouslySetInnerHTML={{__html: bodyHtml}}
                                    />
                                )}
                            </div>

                            <button
                                type="button"
                                className="pd_read_more"
                                onClick={() => setIsDescriptionOpen(prev => !prev)}
                            >
                                {isDescriptionOpen ? 'Show less' : 'Read more'}
                                <span
                                    className={`pd_read_more_arrow ${
                                        isDescriptionOpen ? 'pd_arrow_up' : ''
                                    }`}
                                >
                                    ↓
                                </span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    const renderLoader = () => (
        <div className="pd_loader">
            <BeatLoader color="#000" />
        </div>
    )

    return (
    <div className="pd_page">
        {isLoading ? renderLoader() : renderProductDetails()}

        {!isLoading && productDetails && (
            <Reviews
                productId={productDetails.id}
                productType={isElectronic ? 'electronics' : 'products'}
            />
        )}
    </div>
)
}

export default ProductDetails

