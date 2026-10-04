import {useState, useRef, useEffect} from 'react'
import {Link} from 'react-router'
import {BeatLoader} from 'react-spinners'
import {Camera, X} from 'lucide-react'

import './index.css'

const API_URL = 'http://localhost:3000'

const ImageSearch = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [preview, setPreview] = useState('')
    const [description, setDescription] = useState('')
    const [results, setResults] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const inputRef = useRef(null)

    useEffect(() => {
        return () => {
            if (preview) URL.revokeObjectURL(preview)
        }
    }, [preview])

    const handleClose = () => {
        setIsOpen(false)
        setPreview('')
        setDescription('')
        setResults(null)
        setError('')
    }

    const handleFile = async event => {
        const file = event.target.files?.[0]
        if (!file) return

        setPreview(URL.createObjectURL(file))
        setResults(null)
        setError('')
        setIsLoading(true)

        try {
            const formData = new FormData()
            formData.append('image', file)

            const response = await fetch(`${API_URL}/search/image`, {
                method: 'POST',
                body: formData,
            })

            if (response.ok) {
                const data = await response.json()
                setDescription(data.description)
                setResults(data.results)
            } else {
                setError('Could not search with this image. Try another one.')
            }
        } catch (err) {
            console.log(err)
            setError('Something went wrong. Please try again.')
        } finally {
            setIsLoading(false)
            event.target.value = ''
        }
    }

    const renderResults = () => {
        if (isLoading) {
            return (
                <div className="is_loader">
                    <BeatLoader color="#000" size={8} />
                </div>
            )
        }

        if (error) return <p className="is_error">{error}</p>

        if (!results) return null

        if (results.length === 0) {
            return <p className="is_empty">No similar products found.</p>
        }

        return (
            <ul className="is_grid">
                {results.map(product => (
                    <li key={product.id}>
                        <Link
                            className="is_card"
                            to={`/products/${product.id}`}
                            onClick={handleClose}
                        >
                            <img
                                className="is_card_image"
                                src={product.image}
                                alt={product.title}
                            />
                            <p className="is_card_title">{product.title}</p>
                            <p className="is_card_price">${product.price}</p>
                        </Link>
                    </li>
                ))}
            </ul>
        )
    }

    return (
        <div className="is_wrapper">
            <button
                type="button"
                className="is_trigger"
                onClick={() => (isOpen ? handleClose() : setIsOpen(true))}
            >
                <Camera size={16} />
                Search by image
            </button>

            {isOpen && (
                <section className="is_panel">
                    <div className="is_panel_top">
                        <h2 className="is_heading">Find similar products</h2>
                        <button
                            type="button"
                            className="is_close"
                            onClick={handleClose}
                            aria-label="Close image search"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div className="is_upload_row">
                        <input
                            ref={inputRef}
                            className="is_file_input"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleFile}
                        />
                        <button
                            type="button"
                            className="is_upload_button"
                            onClick={() => inputRef.current?.click()}
                            disabled={isLoading}
                        >
                            {preview ? 'Choose another photo' : 'Upload a photo'}
                        </button>

                        {preview && (
                            <img className="is_preview" src={preview} alt="Your upload" />
                        )}
                    </div>

                    {description && !isLoading && (
                        <p className="is_description">We see: {description}</p>
                    )}

                    {renderResults()}
                </section>
            )}
        </div>
    )
}

export default ImageSearch