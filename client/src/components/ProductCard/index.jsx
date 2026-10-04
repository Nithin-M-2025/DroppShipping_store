
/*
import {Link} from 'react-router'
import './index.css'

const ProductCard = ({ productDetails }) => {
  const { id , title , vendor, productType, tags, images } = productDetails
  const imageSrc = images?.[0]?.src

  const tagList = (Array.isArray(tags) ? tags : (tags || '').split(','))
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 3)

  return (
    <Link to={`products/${id}`} className="product_card">
      <div className="product_media">
        {imageSrc ? (
          <img src={imageSrc} alt={title} className="product_image" loading="lazy" />
        ) : (
          <div className="product_placeholder">No image</div>
        )}
        {productType && <span className="product_badge">{productType}</span>}
      </div>

      <div className="product_body">
        <p className="product_vendor">{vendor}</p>
        <h3 className="product_title">{title}</h3>

        {tagList.length > 0 && (
          <ul className="product_tags">
            {tagList.map((tag) => (
              <li key={tag} className="product_tag">{tag}</li>
            ))}
          </ul>
        )}
      </div>
    </Link>
  )
}

export default ProductCard


*/

import {useState} from 'react'
import {Link} from 'react-router'
import './index.css'

const ProductCard = ({productDetails}) => {
  const [imageFailed, setImageFailed] = useState(false)

  const {
    id,
    title,
    vendor,
    productType,
    tags,
    images,
    categoryName,
    image1,
    price,
  } = productDetails

  // formattedData from ElectronicProducts has camelCase category fields
  const isElectronic = 'categoryName' in productDetails

  const imageSrc = isElectronic ? image1 : images?.[0]?.src
  const badgeText = isElectronic ? categoryName : productType
  const linkTo = isElectronic ? `/electronics/${id}` : `/products/${id}`

  const tagList = isElectronic
    ? []
    : (Array.isArray(tags) ? tags : (tags || '').split(','))
        .map(tag => tag.trim())
        .filter(Boolean)
        .slice(0, 3)

  return (
    <Link to={linkTo} className="product_card">
      <div className="product_media">
        {imageSrc && !imageFailed ? (
          <img
            src={imageSrc}
            alt={title}
            className="product_image"
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="product_placeholder">No image</div>
        )}
        {badgeText && <span className="product_badge">{badgeText}</span>}
      </div>

      <div className="product_body">
        {vendor && <p className="product_vendor">{vendor}</p>}
        <h3 className="product_title">{title}</h3>

        {isElectronic && price !== undefined && price !== null && (
          <p className="product_price">${price}</p>
        )}

        {tagList.length > 0 && (
          <ul className="product_tags">
            {tagList.map(tag => (
              <li key={tag} className="product_tag">{tag}</li>
            ))}
          </ul>
        )}
      </div>
    </Link>
  )
}

export default ProductCard