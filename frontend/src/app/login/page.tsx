'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { useGoogleLogin } from '@react-oauth/google'
import { useLanguage } from '../../contexts/LanguageContext'

function LoginContent() {
  const [isLogin, setIsLogin] = useState(true)
  const [step, setStep] = useState(1) // 1: Email, 2: Password, 3: Name (for signup)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showSignupPassword, setShowSignupPassword] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const [redirect, setRedirect] = useState<string | null>(null)
  const { t } = useLanguage()
  
  // 2FA State
  const [requires2FA, setRequires2FA] = useState(false)
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpError, setOtpError] = useState('')
  const [userId, setUserId] = useState('')
  const [userName, setUserName] = useState('')
  const [userRole, setUserRole] = useState('')
  const [creatorType, setCreatorType] = useState('')
  
  useEffect(() => {
    // Manually extract the redirect parameter from the URL to include any query parameters it might have
    const params = new URLSearchParams(window.location.search)
    // We want the raw value of everything after "redirect="
    const fullUrl = window.location.search
    const redirectPrefix = 'redirect='
    const redirectIndex = fullUrl.indexOf(redirectPrefix)
    
    if (redirectIndex !== -1) {
      const redirectValue = fullUrl.substring(redirectIndex + redirectPrefix.length)
      setRedirect(decodeURIComponent(redirectValue))
    }
  }, [])

  const { login } = useAuth()

  const googleLogin = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: async (response) => {
      try {
        console.log('Google login response:', response);
        setIsLoading(true);
        setError('');
        
        // Check if we have a code (authorization code flow)
        const code = response.code;
        if (!code) {
          setError('Google login failed: No authorization code received');
          setIsLoading(false);
          return;
        }
        
        // Send the Google authorization code to our backend
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          setError(errorData.message || 'Google login failed');
          setIsLoading(false);
          return;
        }

        const userData = await res.json();
        
        // Store access token and refresh token in localStorage
        localStorage.setItem('accessToken', userData.accessToken);
        localStorage.setItem('refreshToken', userData.refreshToken);
        
        // Log in the user with actual data from API
        login({
          id: userData._id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          creatorType: userData.creatorType
        });
        
        // Redirect based on user role
        if (userData.role === 'admin') {
          router.push('/admin');
        } else {
          const redirectPath = redirect || '/';
          router.push(redirectPath);
        }
      } catch (err) {
        console.error('Google login error:', err);
        setError('An unexpected error occurred. Please try again.');
        setIsLoading(false);
      }
    },
    onError: () => {
      setError('Google login failed. Please try again.');
    }
  });

  // Reset form when switching between login/signup
  useEffect(() => {
    setEmail('')
    setPassword('')
    setName('')
    setError('')
    setStep(1)
    setShowPassword(false)
    setShowSignupPassword(false)
    setAgreeToTerms(false)
  }, [isLogin])

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('') // Clear any previous errors
    if (isLogin) {
      setStep(2) // Go to password step for login
    } else {
      setStep(3) // Go to name step for signup
    }
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate password
    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }
    
    setIsLoading(true)
    setError('')
    setOtpError('')
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.message || 'Login failed')
        setIsLoading(false)
        return
      }

      const userData = await response.json()
      
      // Check if 2FA is required (for artists)
      if (userData.requires2FA) {
        // Artist needs to verify OTP
        setRequires2FA(true)
        setUserId(userData._id)
        setUserName(userData.name)
        setUserRole(userData.role)
        setCreatorType(userData.creatorType)
        setOtpSent(true)
        setIsLoading(false)
        setError('')
        return
      }
    
      // For non-artists, complete login normally
      // Store access token and refresh token in localStorage
      localStorage.setItem('accessToken', userData.accessToken)
      localStorage.setItem('refreshToken', userData.refreshToken)
      
      // Log in the user with actual data from API
      login({
        id: userData._id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        creatorType: userData.creatorType
      })
      
      // Redirect based on user role
      if (userData.role === 'admin') {
        router.push('/admin')
      } else {
        // All other users go to home page or redirect after login
        const redirectPath = redirect || '/';
        router.push(redirectPath)
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate password
    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }
    
    // Check if password contains letters, numbers, and special characters
    const hasLetters = /[a-zA-Z]/.test(password)
    const hasNumbers = /[0-9]/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
    
    if (!hasLetters || !hasNumbers || !hasSpecialChar) {
      setError('Password must contain letters, numbers, and special characters')
      return
    }
    
    // Check terms agreement
    if (!agreeToTerms) {
      setError('Please agree to the Terms and Privacy Policy')
      return
    }
    
    setIsLoading(true)
    setError('')
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.message || 'Registration failed')
        setIsLoading(false)
        return
      }

      const userData = await response.json()
      
      // Store access token and refresh token in localStorage
      localStorage.setItem('accessToken', userData.accessToken)
      localStorage.setItem('refreshToken', userData.refreshToken)
    
      // Log in the user with actual data from API
      login({
        id: userData._id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        creatorType: userData.creatorType
      })
    
      // Redirect based on user role
      if (userData.role === 'admin') {
        router.push('/admin')
      } else {
        // All other users go to home page or redirect after signup
        router.push(redirect || '/')
      }
    } catch (error) {
      console.error('Signup error:', error)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle OTP verification for artist 2FA
  const handleOTPVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (otp.length !== 6) {
      setOtpError('OTP must be 6 digits')
      return
    }
    
    setIsLoading(true)
    setOtpError('')
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/2fa/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          otp, 
          password 
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setOtpError(errorData.message || 'OTP verification failed')
        setIsLoading(false)
        return
      }

      const userData = await response.json()
      
      // Store tokens
      localStorage.setItem('accessToken', userData.accessToken)
      localStorage.setItem('refreshToken', userData.refreshToken)
      
      // Complete login
      login({
        id: userData._id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        creatorType: userData.creatorType
      })
      
      // Redirect
      if (userData.role === 'admin') {
        router.push('/admin')
      } else {
        const redirectPath = redirect || '/';
        router.push(redirectPath)
      }
    } catch (error) {
      console.error('OTP verification error:', error)
      setOtpError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Resend OTP
  const handleResendOTP = async () => {
    setIsLoading(true)
    setOtpError('')
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/2fa/resend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setOtpError(errorData.message || 'Failed to resend OTP')
        setIsLoading(false)
        return
      }

      setOtpSent(true)
      setIsLoading(false)
    } catch (error) {
      console.error('Resend OTP error:', error)
      setOtpError('Failed to resend OTP')
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    setError('') // Clear any previous errors
    if (step === 2) {
      setStep(1)
    } else if (step === 3) {
      setStep(1)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-900 to-black p-4 relative">
      <div className="absolute top-1/3 left-0 w-32 h-32 bg-[#FF4D67]/10 rounded-full blur-3xl -z-10 opacity-70 md:w-48 md:h-48 md:top-1/4 md:left-1/4"></div>
      <div className="absolute bottom-1/3 right-0 w-32 h-32 bg-[#FFCB2B]/10 rounded-full blur-3xl -z-10 opacity-70 md:w-48 md:h-48 md:bottom-1/4 md:right-1/4"></div>
      
      <div className="w-full max-w-md space-y-4 sm:space-y-5 card-bg rounded-2xl p-5 sm:p-7 border border-gray-700/50 shadow-2xl shadow-[#FF4D67]/10 relative z-10">
        <div className="text-center animate-fade-in">
          <div className="flex justify-center mb-2 items-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shadow-xl bg-black">
              <img 
                src="/muzikax.png" 
                alt="MuzikaX - Rwanda's Digital Music Ecosystem" 
                className="w-full h-full object-cover rounded-xl transition-transform duration-300 hover:scale-105"
              />
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">
            MuzikaX
          </h1>
          <h2 className="mt-1 sm:mt-1.5 text-lg sm:text-xl font-bold text-white">
            {isLogin ? (t('login') || 'Welcome back') : (t('signUp') || 'Create account')}
          </h2>
          <p className="mt-1 sm:mt-1.5 text-gray-300 text-xs sm:text-sm max-w-md mx-auto">
            {isLogin 
              ? 'Sign in to your account to continue' 
              : 'Join our community of Rwandan music creators and fans'}
          </p>
          {!isLogin && (
            <p className="mt-1 text-gray-400 text-[10px] sm:text-xs max-w-md mx-auto">
              New accounts start as regular users. Upgrade to creator later.
            </p>
          )}
        </div>

        <div className="flex bg-gray-800/50 rounded-lg p-1">
          <button
            className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-colors ${
              isLogin 
                ? 'bg-[#FF4D67] text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => {
              setIsLogin(true)
              setStep(1)
            }}
          >
            {t('login') || 'Login'}
          </button>
          <button
            className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-colors ${
              !isLogin 
                ? 'bg-[#FF4D67] text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => {
              setIsLogin(false)
              setStep(1)
            }}
          >
            {t('signUp') || 'Sign Up'}
          </button>
        </div>

        {/* Step 1: Email */}
        {step === 1 && (
          <form className="mt-4 sm:mt-5 space-y-4" onSubmit={handleEmailSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 sm:px-4 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF4D67] focus:border-transparent transition-all text-sm sm:text-base"
                placeholder="you@example.com"
              />
            </div>
    
            {error && (
              <div className="text-red-500 text-xs py-1">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 sm:py-2.5 px-4 gradient-primary rounded-lg text-white font-medium hover:opacity-90 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF4D67] focus:ring-offset-gray-900 text-sm sm:text-base flex items-center justify-center disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : 'Next'}
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Password (Login) */}
        {step === 2 && isLogin && (
          <form className="mt-6 sm:mt-8 space-y-6" onSubmit={handleLoginSubmit}>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                  Password
                </label>
                <div className="text-sm">
                  <a href="#" className="font-medium text-[#FF4D67] hover:text-[#FF4D67]/80">
                    Forgot password?
                  </a>
                </div>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF4D67] focus:border-transparent transition-all text-sm sm:text-base pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {password && password.length < 6 && (
                <p className="mt-1 text-xs text-red-400">Password must be at least 6 characters</p>
              )}
            </div>
    
            {error && (
              <div className="text-red-500 text-sm py-2">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 sm:py-3 px-4 gradient-primary rounded-lg text-white font-medium hover:opacity-90 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF4D67] focus:ring-offset-gray-900 text-sm sm:text-base flex items-center justify-center disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : 'Sign in'}
              </button>
            </div>
          </form>
        )}

        {/* 2FA - OTP Verification for Artists and Admins */}
        {requires2FA && (
          <div className="mt-6 sm:mt-8">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-3">
                <div className="w-16 h-16 bg-gradient-to-r from-[#FF4D67] to-[#FF6B6B] rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                Two-Factor Authentication
              </h2>
              <p className="text-gray-400 text-sm">
                We've sent a 6-digit verification code to <strong className="text-white">{email}</strong>
              </p>
              <p className="text-gray-500 text-xs mt-2">
                Check your inbox and spam folder. Code expires in 10 minutes.
              </p>
            </div>

            <form onSubmit={handleOTPVerify} className="space-y-4">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-300 mb-2 text-center">
                  Enter Verification Code
                </label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  inputMode="numeric"
                  pattern="\d{6}"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-3 bg-gray-800/50 border-2 border-gray-700 rounded-lg text-white text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-[#FF4D67] focus:border-transparent transition-all"
                  placeholder="000000"
                  autoComplete="off"
                />
                {otpError && (
                  <p className="text-red-500 text-xs mt-2 text-center">
                    {otpError}
                  </p>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading || otp.length !== 6}
                  className="w-full py-3 px-4 gradient-primary rounded-lg text-white font-medium hover:opacity-90 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF4D67] focus:ring-offset-gray-900 text-base flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
                    </>
                  ) : (
                    'Verify & Continue'
                  )}
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={isLoading}
                  className="text-sm text-[#FF4D67] hover:text-[#FF6B6B] transition-colors disabled:opacity-50"
                >
                  Resend Code
                </button>
                <p className="text-gray-500 text-xs mt-2">
                  Valid for 10 minutes
                </p>
              </div>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-800">
              <button
                onClick={() => {
                  setRequires2FA(false)
                  setStep(1)
                  setOtp('')
                  setOtpError('')
                }}
                className="w-full text-sm text-gray-400 hover:text-white transition-colors"
              >
                ← Back to Login
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Name and Password (Signup) */}
        {step === 3 && !isLogin && (
          <form className="mt-6 sm:mt-8 space-y-6" onSubmit={handleSignupSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                Full name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF4D67] focus:border-transparent transition-all text-sm sm:text-base"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="signup-password" className="block text-sm font-medium text-gray-300 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="signup-password"
                  name="password"
                  type={showSignupPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF4D67] focus:border-transparent transition-all text-sm sm:text-base pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowSignupPassword(!showSignupPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
                >
                  {showSignupPassword ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              <div className="mt-2 space-y-1">
                <p className="text-xs text-gray-500">Password requirements:</p>
                <ul className="text-xs space-y-1">
                  <li className={password.length >= 8 ? "text-green-400" : "text-gray-500"}>
                    • At least 8 characters
                  </li>
                  <li className={/[a-zA-Z]/.test(password) ? "text-green-400" : "text-gray-500"}>
                    • Contains letters
                  </li>
                  <li className={/[0-9]/.test(password) ? "text-green-400" : "text-gray-500"}>
                    • Contains numbers
                  </li>
                  <li className={/[!@#$%^&*(),.?":{}|<>]/.test(password) ? "text-green-400" : "text-gray-500"}>
                    • Contains special characters
                  </li>
                </ul>
              </div>
            </div>
    
            {error && (
              <div className="text-red-500 text-sm py-2">
                {error}
              </div>
            )}

            {/* Terms and Privacy Checkbox */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="h-4 w-4 text-[#FF4D67] focus:ring-[#FF4D67] border-gray-600 rounded bg-gray-700"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="terms" className="text-gray-300">
                  I agree to the{' '}
                  <Link href="/terms" className="text-[#FF4D67] hover:text-[#FF4D67]/80">
                    Terms of Service
                  </Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="text-[#FF4D67] hover:text-[#FF4D67]/80">
                    Privacy Policy
                  </Link>
                </label>
              </div>
            </div>
            
            <div className="text-sm text-gray-400">
              By signing up, you'll be registered as a regular user. You can upgrade to a creator account when you're ready to upload music.
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 sm:py-3 px-4 gradient-primary rounded-lg text-white font-medium hover:opacity-90 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF4D67] focus:ring-offset-gray-900 text-sm sm:text-base flex items-center justify-center disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                  </>
                ) : 'Create account'}
              </button>
            </div>
          </form>
        )}

        <div className="mt-4 sm:mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-900 text-gray-400">
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-4 sm:mt-6">
            <button 
              onClick={() => googleLogin()}
              disabled={isLoading}
              className="w-full inline-flex justify-center py-2 px-4 rounded-lg bg-gray-800/50 text-gray-300 hover:text-white transition-colors border border-gray-700 items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"></path>
              </svg>
              Continue with Google
            </button>
          </div>
        </div>

        <div className="text-center mt-4 sm:mt-6">
          <p className="text-sm text-gray-400">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => {
                setIsLogin(!isLogin)
                setStep(1)
              }}
              className="font-medium text-[#FF4D67] hover:text-[#FF4D67]/80 transition-colors"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function Login() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF4D67]"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}