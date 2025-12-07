'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Login() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('fan')
  const [creatorType, setCreatorType] = useState('artist')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log(isLogin ? 'Logging in...' : 'Signing up...', { email, password, name, role, creatorType })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-900 to-black p-4">
      <div className="absolute -top-40 -left-40 w-80 h-80 bg-[#FF4D67]/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-[#FFCB2B]/10 rounded-full blur-3xl -z-10"></div>
      
      <div className="w-full max-w-md space-y-6 sm:space-y-8 card-bg rounded-2xl p-6 sm:p-8 border border-gray-700/50 shadow-2xl shadow-[#FF4D67]/10">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#FF4D67] to-[#FFCB2B]">
            MUZIKAX
          </h1>
          <h2 className="mt-3 sm:mt-4 text-xl sm:text-2xl font-bold text-white">
            {isLogin ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="mt-1 sm:mt-2 text-gray-400 text-sm sm:text-base">
            {isLogin 
              ? 'Sign in to your account to continue' 
              : 'Join our community of Rwandan music creators and fans'}
          </p>
        </div>

        <div className="flex bg-gray-800/50 rounded-lg p-1">
          <button
            className={`flex-1 py-2 px-3 sm:px-4 rounded-md text-sm font-medium transition-colors ${
              isLogin 
                ? 'bg-[#FF4D67] text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button
            className={`flex-1 py-2 px-3 sm:px-4 rounded-md text-sm font-medium transition-colors ${
              !isLogin 
                ? 'bg-[#FF4D67] text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setIsLogin(false)}
          >
            Sign Up
          </button>
        </div>

        <form className="mt-6 sm:mt-8 space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
          {!isLogin && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF4D67] focus:border-transparent transition-all text-sm sm:text-base"
                placeholder="John Doe"
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF4D67] focus:border-transparent transition-all text-sm sm:text-base"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF4D67] focus:border-transparent transition-all text-sm sm:text-base"
              placeholder="••••••••"
            />
          </div>

          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Account Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['fan', 'creator', 'admin'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      className={`py-2 px-2 sm:px-3 rounded-lg text-sm font-medium transition-all ${
                        role === type
                          ? 'bg-[#FF4D67] text-white'
                          : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                      }`}
                      onClick={() => setRole(type)}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {role === 'creator' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Creator Type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['artist', 'dj', 'producer'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        className={`py-2 px-2 sm:px-3 rounded-lg text-sm font-medium transition-all ${
                          creatorType === type
                            ? 'bg-[#FFCB2B] text-gray-900'
                            : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                        }`}
                        onClick={() => setCreatorType(type)}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          <div>
            <button
              type="submit"
              className="w-full py-2.5 sm:py-3 px-4 gradient-primary rounded-lg text-white font-medium hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF4D67] focus:ring-offset-gray-900 text-sm sm:text-base"
            >
              {isLogin ? 'Sign in' : 'Create account'}
            </button>
          </div>
        </form>

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

          <div className="mt-4 sm:mt-6 grid grid-cols-3 gap-2 sm:gap-3">
            <button className="w-full inline-flex justify-center py-2 px-3 rounded-lg bg-gray-800/50 text-gray-300 hover:text-white transition-colors border border-gray-700">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
              </svg>
            </button>
            <button className="w-full inline-flex justify-center py-2 px-3 rounded-lg bg-gray-800/50 text-gray-300 hover:text-white transition-colors border border-gray-700">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"></path>
              </svg>
            </button>
            <button className="w-full inline-flex justify-center py-2 px-3 rounded-lg bg-gray-800/50 text-gray-300 hover:text-white transition-colors border border-gray-700">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
              </svg>
            </button>
          </div>
        </div>

        <div className="text-center mt-4 sm:mt-6">
          <p className="text-sm text-gray-400">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
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