import {useState} from 'react'
import {Link, useNavigate} from 'react-router'
import './index.css'

const Register = () => {
    const navigate = useNavigate()

    const [name, setName] = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [errorMsg, setErrorMsg] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const onChangeName = event => {
        setName(event.target.value)
        if (errorMsg) setErrorMsg('')
    }

    const onChangeUsername = event => {
        setUsername(event.target.value)
        if (errorMsg) setErrorMsg('')
    }

    const onChangePassword = event => {
        setPassword(event.target.value)
        if (errorMsg) setErrorMsg('')
    }

    const onChangeConfirmPassword = event => {
        setConfirmPassword(event.target.value)
        if (errorMsg) setErrorMsg('')
    }

    const onSubmitSuccess = () => {
        navigate('/login', {replace: true})
    }

    const submitForm = async event => {
        event.preventDefault()
        setErrorMsg('')

        if (password.length < 6) {
            setErrorMsg('Password must be at least 6 characters')
            return
        }

        if (password !== confirmPassword) {
            setErrorMsg('Passwords do not match')
            return
        }

        setIsSubmitting(true)

        const userDetails = {name, username, password}
        const url = 'http://localhost:3000/register'
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userDetails),
        }

        try {
            const response = await fetch(url, options)
            const data = await response.json()

            if (response.ok === true) {
                onSubmitSuccess()
            } else {
                setErrorMsg(data.errorMsg || 'Registration failed')
            }
        } catch (error) {
            setErrorMsg('Something went wrong. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="rg_page">
            <div className="rg_card">
                <img
                    src="https://assets.ccbp.in/frontend/react-js/nxt-trendz-login-img.png"
                    className="rg_image"
                    alt="website register"
                />

                <form className="rg_form" onSubmit={submitForm}>
                    <h1 className="rg_heading">Create your account</h1>
                    <p className="rg_subheading">Sign up to start shopping</p>

                    <label className="rg_label" htmlFor="name">
                        Full name
                    </label>
                    <input
                        type="text"
                        id="name"
                        className="rg_input"
                        value={name}
                        onChange={onChangeName}
                        placeholder="Enter your name"
                        autoComplete="name"
                    />

                    <label className="rg_label" htmlFor="username">
                        Username
                    </label>
                    <input
                        type="text"
                        id="username"
                        className="rg_input"
                        value={username}
                        onChange={onChangeUsername}
                        placeholder="Choose a username"
                        autoComplete="username"
                    />

                    <label className="rg_label" htmlFor="password">
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        className="rg_input"
                        value={password}
                        onChange={onChangePassword}
                        placeholder="Create a password"
                        autoComplete="new-password"
                    />

                    <label className="rg_label" htmlFor="confirmPassword">
                        Confirm password
                    </label>
                    <input
                        type="password"
                        id="confirmPassword"
                        className="rg_input"
                        value={confirmPassword}
                        onChange={onChangeConfirmPassword}
                        placeholder="Re-enter your password"
                        autoComplete="new-password"
                    />

                    {errorMsg && <p className="rg_error">{errorMsg}</p>}

                    <button
                        type="submit"
                        className="rg_button"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Creating account...' : 'Register'}
                    </button>

                    <p className="rg_switch_text">
                        Already have an account?{' '}
                        <Link to="/login" className="rg_switch_link">
                            Login
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    )
}

export default Register