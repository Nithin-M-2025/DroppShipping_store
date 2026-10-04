import {useState} from 'react'
import {Mail, MapPin, Phone, Send, CheckCircle2} from 'lucide-react'

import './index.css'

const initialFormState = {
    name: '',
    email: '',
    subject: '',
    message: '',
}

const isValidEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

const Contact = () => {
    const [formData, setFormData] = useState(initialFormState)
    const [errors, setErrors] = useState({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)

    const onChangeField = event => {
        const {name, value} = event.target
        setFormData(prev => ({...prev, [name]: value}))

        if (errors[name]) {
            setErrors(prev => ({...prev, [name]: ''}))
        }
    }

    const validate = () => {
        const nextErrors = {}

        if (!formData.name.trim()) nextErrors.name = 'Name is required'
        if (!formData.email.trim()) {
            nextErrors.email = 'Email is required'
        } else if (!isValidEmail(formData.email)) {
            nextErrors.email = 'Enter a valid email'
        }
        if (!formData.subject.trim()) nextErrors.subject = 'Subject is required'
        if (!formData.message.trim()) nextErrors.message = 'Message is required'

        setErrors(nextErrors)
        return Object.keys(nextErrors).length === 0
    }

    const submitForm = async event => {
        event.preventDefault()

        if (!validate()) return

        setIsSubmitting(true)

        try {
            const url = 'http://localhost:3000/contact'
            const options = {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(formData),
            }

            await fetch(url, options)

            setIsSubmitted(true)
            setFormData(initialFormState)
        } catch (error) {
            console.log(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const renderSuccess = () => (
        <div className="ct_success">
            <CheckCircle2 size={40} className="ct_success_icon" />
            <h2 className="ct_success_title">Message sent</h2>
            <p className="ct_success_text">
                Thanks for reaching out — we'll get back to you within a day
                or two.
            </p>
            <button
                type="button"
                className="ct_success_button"
                onClick={() => setIsSubmitted(false)}
            >
                Send another message
            </button>
        </div>
    )

    const renderForm = () => (
        <form className="ct_form" onSubmit={submitForm} noValidate>
            <div className="ct_field_row">
                <div className="ct_field">
                    <label className="ct_label" htmlFor="name">
                        Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        className={`ct_input ${errors.name ? 'ct_input_error' : ''}`}
                        value={formData.name}
                        onChange={onChangeField}
                        placeholder="Your name"
                    />
                    {errors.name && <p className="ct_field_error">{errors.name}</p>}
                </div>

                <div className="ct_field">
                    <label className="ct_label" htmlFor="email">
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        className={`ct_input ${errors.email ? 'ct_input_error' : ''}`}
                        value={formData.email}
                        onChange={onChangeField}
                        placeholder="you@example.com"
                    />
                    {errors.email && (
                        <p className="ct_field_error">{errors.email}</p>
                    )}
                </div>
            </div>

            <div className="ct_field">
                <label className="ct_label" htmlFor="subject">
                    Subject
                </label>
                <input
                    type="text"
                    id="subject"
                    name="subject"
                    className={`ct_input ${errors.subject ? 'ct_input_error' : ''}`}
                    value={formData.subject}
                    onChange={onChangeField}
                    placeholder="What's this about?"
                />
                {errors.subject && (
                    <p className="ct_field_error">{errors.subject}</p>
                )}
            </div>

            <div className="ct_field">
                <label className="ct_label" htmlFor="message">
                    Message
                </label>
                <textarea
                    id="message"
                    name="message"
                    className={`ct_input ct_textarea ${
                        errors.message ? 'ct_input_error' : ''
                    }`}
                    value={formData.message}
                    onChange={onChangeField}
                    placeholder="Tell us how we can help"
                    rows={5}
                />
                {errors.message && (
                    <p className="ct_field_error">{errors.message}</p>
                )}
            </div>

            <button
                type="submit"
                className="ct_submit_button"
                disabled={isSubmitting}
            >
                {isSubmitting ? (
                    'Sending...'
                ) : (
                    <>
                        Send message
                        <Send size={15} />
                    </>
                )}
            </button>
        </form>
    )

    return (
        <div className="ct_page">
            <div className="ct_intro">
                <p className="ct_eyebrow">Get in touch</p>
                <h1 className="ct_heading">We'd love to hear from you</h1>
                <p className="ct_subheading">
                    Questions about an order, a product, or anything else —
                    send us a message and we'll get back to you soon.
                </p>
            </div>

            <div className="ct_layout">
                <div className="ct_card ct_form_card">
                    {isSubmitted ? renderSuccess() : renderForm()}
                </div>

                <aside className="ct_card ct_info_card">
                    <h2 className="ct_info_heading">Contact details</h2>

                    <div className="ct_info_item">
                        <span className="ct_info_icon">
                            <Mail size={17} />
                        </span>
                        <div>
                            <p className="ct_info_label">Email</p>
                            <p className="ct_info_value">TaylorStitch@gmail.com</p>
                        </div>
                    </div>

                    <div className="ct_info_item">
                        <span className="ct_info_icon">
                            <Phone size={17} />
                        </span>
                        <div>
                            <p className="ct_info_label">Phone</p>
                            <p className="ct_info_value">+91 7593880406</p>
                        </div>
                    </div>

                    <div className="ct_info_item">
                        <span className="ct_info_icon">
                            <MapPin size={17} />
                        </span>
                        <div>
                            <p className="ct_info_label">Address</p>
                            <p className="ct_info_value">
                                123 Market Street, San Francisco, CA
                            </p>
                        </div>
                    </div>

                    <div className="ct_info_divider" />

                    <p className="ct_info_hours_label">Support hours</p>
                    <p className="ct_info_hours_value">
                        Mon – Fri, 9:00 AM – 6:00 PM
                    </p>
                </aside>
            </div>
        </div>
    )
}

export default Contact