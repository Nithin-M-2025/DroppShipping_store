import {useEffect, useState} from 'react'
import {Link} from 'react-router'
import {useSelector} from 'react-redux'

import {selectTotalItems} from '../../store/cartSlice'

import './index.css'

const Header = () => {
    const [isVisible, setIsVisible] = useState(true)
    const totalItems = useSelector(selectTotalItems)

    useEffect(() => {
        let lastScrollY = window.scrollY

        const handleScroll = () => {
            const currentScrollY = window.scrollY

            if (currentScrollY > lastScrollY && currentScrollY > 60) {
                setIsVisible(false)
            } else {
                setIsVisible(true)
            }

            lastScrollY = currentScrollY
        }

        window.addEventListener('scroll', handleScroll)

        return () => {
            window.removeEventListener('scroll', handleScroll)
        }
    }, [])

    return (
        <header className={`hd_header ${isVisible ? 'hd_show' : 'hd_hide'}`}>
            <Link to="/" className="hd_logo_container">
                <h1 className="hd_logo">Taylor Stitch</h1>
            </Link>

            <ul className="hd_nav">
                <li>
                    <Link to="/" className = "hd_nav_item">
                        Shop
                    </Link>
                </li>
                <li>
                    <Link to="/about" className="hd_nav_item">
                        About
                    </Link>
                </li>

                <li className="hd_nav_item">Categories</li>

                <li>
                    <Link to="/contact" className="hd_nav_item">
                        Contact
                    </Link>
                </li>
            </ul>

            <Link to="/cart" className="hd_cart">
                <span className="hd_cart_text">Cart ({totalItems})</span>
            </Link>
        </header>
    )
}

export default Header