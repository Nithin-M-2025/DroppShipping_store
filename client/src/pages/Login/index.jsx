import {useState} from 'react'
import Cookies from 'js-cookie'
import {Link, useNavigate} from 'react-router'
import './index.css'

const Login = () => {
    const navigate = useNavigate()

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [errorMsg, setErrorMsg] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const onChangeUsername = event => {
        setUsername(event.target.value)
        if (errorMsg) setErrorMsg('')
    }

    const onChangePassword = event => {
        setPassword(event.target.value)
        if (errorMsg) setErrorMsg('')
    }

    const onSubmitSuccess = jwtToken => {
        Cookies.set('jwt_token' , jwtToken , {expires:30})
        navigate('/', {replace: true})
    }

    const submitForm = async event => {
        event.preventDefault()
        setErrorMsg('')
        setIsSubmitting(true)

        const userDetails = {username, password}
        const url = 'http://localhost:3000/login'
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
                onSubmitSuccess(data.jwtToken)
            } else {
                setErrorMsg(data.errorMsg || 'Invalid username or password')
            }
        } catch (error) {
            setErrorMsg('Something went wrong. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="lg_page">
            <div className="lg_card">
                <img
                    src="https://assets.ccbp.in/frontend/react-js/nxt-trendz-login-img.png"
                    className="lg_image"
                    alt="website login"
                />

                <form className="lg_form" onSubmit={submitForm}>
                    <h1 className="lg_heading">Welcome back</h1>
                    <p className="lg_subheading">Sign in to continue shopping</p>

                    <label className="lg_label" htmlFor="username">
                        Username
                    </label>
                    <input
                        type="text"
                        id="username"
                        className="lg_input"
                        value={username}
                        onChange={onChangeUsername}
                        placeholder="Enter your username"
                        autoComplete="username"
                    />

                    <label className="lg_label" htmlFor="password">
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        className="lg_input"
                        value={password}
                        onChange={onChangePassword}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                    />

                    {errorMsg && <p className="lg_error">{errorMsg}</p>}

                    <button
                        type="submit"
                        className="lg_button"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Signing in...' : 'Login'}
                    </button>
                    <p className="lg_switch_text">
                        Don't have an account?{' '}
                        <Link to="/register" className="lg_switch_link">
                            Register
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    )
}

export default Login