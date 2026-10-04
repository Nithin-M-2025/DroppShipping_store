import {Link} from 'react-router'

import './index.css'

const NotFound = () => {
    return (
        <div className="nf_page">
            <div className="nf_card">
                <p className="nf_code">404</p>
                <h1 className="nf_title">Page not found</h1>
                <p className="nf_text">
                    The page you are looking for doesn't exist or may have been
                    moved.
                </p>

                <Link to="/" className="nf_button">
                    Back to Home
                </Link>
            </div>
        </div>
    )
}

export default NotFound