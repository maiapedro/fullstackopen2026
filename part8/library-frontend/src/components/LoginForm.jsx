import { useState } from 'react'
import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      value
    }
  }
`

const LoginForm = ({ show, onLogin }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [login] = useMutation(LOGIN)

  if (!show) {
    return null
  }

  const submit = async (event) => {
    event.preventDefault()

    try {
      const result = await login({
        variables: { username, password },
      })

      const token = result.data.login.value
      onLogin(token)
      setUsername('')
      setPassword('')
      setErrorMessage('')
    } catch (error) {
      setErrorMessage('login failed')
    }
  }

  return (
    <div>
      <h2>login</h2>
      {errorMessage ? <div>{errorMessage}</div> : null}
      <form onSubmit={submit}>
        <div>
          <label htmlFor="username">username</label>
          <input
            id="username"
            value={username}
            onChange={({ target }) => setUsername(target.value)}
          />
        </div>
        <div>
          <label htmlFor="password">password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={({ target }) => setPassword(target.value)}
          />
        </div>
        <button type="submit">login</button>
      </form>
    </div>
  )
}

export default LoginForm
