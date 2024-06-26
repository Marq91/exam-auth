import { createContext, useState, useContext, useEffect } from 'react'
import Cookies from 'js-cookie'
import { registerRequest, loginRequest, verifyTokenRequest } from '../api/auth'

export const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context

}

export const AuthProvider = ({children}) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [errors, setErrors] = useState([])
  const [loading, setLoading] = useState(true)

  const signup = async (user) => {
    try {
      const res = await registerRequest(user)
      console.log(res.data)
      setUser(res.data)
      setIsAuthenticated(true)
    } catch (error) {
      console.log(error.response)
      setErrors(error.response.data)
    }
  }

  const signin = async (user) => {
    try {
      const res = await loginRequest(user)
      console.log(res.data)
      setUser(res.data)
      setIsAuthenticated(true)
    } catch (error) {
      if (Array.isArray(error.response.data)) {
        return setErrors(error.response.data)
      }
      setErrors([error.response.data.message])
    }
  }

  useEffect(() => {
    if (errors.length > 0) { 
      const timer = setTimeout(() => {
        setErrors([])
      }, 7000)
      return () => clearTimeout(timer)
    }
  }, [errors])

  useEffect(() => {
    async function checkLogin() {
      const cookies = Cookies.get()
      console.log("token de cookies", cookies)

      if (!cookies.token) {
        setIsAuthenticated(false)
        setLoading(false)
        setUser(null)
        return
      }

      try {
        const res = await verifyTokenRequest(cookies.token)
        if (!res.data) {
          setIsAuthenticated(false)
          setLoading(false)
          return
        }

        setIsAuthenticated(true)
        setUser(res.data)
        setLoading(false)
      } catch (error) {
        console.log(error)
        setIsAuthenticated(false)
        setUser(null)
        setLoading(false)
      }
    }

    checkLogin()
  }, [])
  
  return (
    <AuthContext.Provider value={{
      signup,
      signin,
      user,
      loading,
      isAuthenticated,
      errors,
    }}>
      {children}
    </AuthContext.Provider>
  )
}
