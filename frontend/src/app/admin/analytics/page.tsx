'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../contexts/AuthContext'
import AdminSidebar from '../../../components/AdminSidebar'

interface UserGrowthData {
  _id: string
  count: number
}

interface ContentStat {
  _id: string
  count: number
  totalPlays: number
}

interface TopCreator {
  _id: string
  name: string
  totalPlays: number
  trackCount: number
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d')
  const [userGrowth, setUserGrowth] = useState<UserGrowthData[]>([])
  const [contentStats, setContentStats] = useState<ContentStat[]>([])
  const [topCreators, setTopCreators] = useState<TopCreator[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()
  const { isAuthenticated, userRole } = useAuth()
  const [authChecked, setAuthChecked] = useState(false)

  // Check authentication and role on component mount
  useEffect(() => {
    // Small delay to ensure AuthContext has time to initialize
    const timer = setTimeout(() => {
      setAuthChecked(true)
      
      if (!isAuthenticated) {
        router.push('/login')
      } else if (userRole !== 'admin') {
        router.push('/')
      } else {
        fetchAnalyticsData()
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [isAuthenticated, userRole, router])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/platform-stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data')
      }
      
      const data = await response.json()
      setUserGrowth(data.userGrowth)
      setContentStats(data.contentStats)
      setTopCreators(data.topCreators)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching analytics data:', err)
      setError('Failed to fetch analytics data')
      setLoading(false)
    }
  }

  // Don't render the page until auth check is complete
  if (!authChecked) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF4D67]"></div>
      </div>
    )
  }

  // Don't render the page if not authenticated or not authorized
  if (!isAuthenticated || userRole !== 'admin') {
    return null
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black">
      <AdminSidebar />
      
      <main className="flex-1 flex flex-col w-full min-h-screen md:ml-64">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#FF4D67]/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#FFCB2B]/10 rounded-full blur-3xl -z-10"></div>
        
        <div className="container mx-auto px-4 sm:px-8 py-6 sm:py-8">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">Analytics Dashboard</h1>
            <p className="text-gray-400 text-sm sm:text-base">Platform insights and performance metrics</p>
          </div>

          {/* Time Range Selector */}
          <div className="flex justify-end mb-6 sm:mb-8">
            <div className="inline-flex rounded-lg bg-gray-800/50 p-1">
              {['7d', '30d', '90d', '1y'].map((range) => (
                <button
                  key={range}
                  type="button"
                  className={`px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                    timeRange === range
                      ? 'bg-[#FF4D67] text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  onClick={() => setTimeRange(range)}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          {/* Platform Growth Chart */}
          <div className="card-bg rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">User Growth</h2>
            
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF4D67]"></div>
              </div>
            ) : error ? (
              <div className="text-red-500 text-center py-8">{error}</div>
            ) : (
              <div className="h-64 flex items-end space-x-1 sm:space-x-2">
                {userGrowth.map((data, index) => (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div 
                      className="w-full bg-gradient-to-t from-[#FF4D67] to-[#FFCB2B] rounded-t-md"
                      style={{ height: `${Math.max(10, (data.count / Math.max(...userGrowth.map(d => d.count))) * 100)}%` }}
                    ></div>
                    <div className="text-gray-400 text-xs mt-2 truncate w-full text-center">
                      {new Date(data._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Content Statistics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div className="card-bg rounded-2xl p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Content Distribution</h2>
              
              {loading ? (
                <div className="flex justify-center items-center h-48">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF4D67]"></div>
                </div>
              ) : error ? (
                <div className="text-red-500 text-center py-4">{error}</div>
              ) : (
                <div className="space-y-4">
                  {contentStats.map((stat, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-[#FF4D67] mr-3"></div>
                        <span className="text-gray-300 capitalize">{stat._id || 'Unknown'}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-medium">{stat.count}</div>
                        <div className="text-gray-500 text-sm">{stat.totalPlays.toLocaleString()} plays</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top Creators */}
            <div className="card-bg rounded-2xl p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Top Creators</h2>
              
              {loading ? (
                <div className="flex justify-center items-center h-48">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF4D67]"></div>
                </div>
              ) : error ? (
                <div className="text-red-500 text-center py-4">{error}</div>
              ) : (
                <div className="space-y-4">
                  {topCreators.map((creator, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF4D67] to-[#FFCB2B] flex items-center justify-center text-white text-xs font-bold mr-3">
                          {index + 1}
                        </div>
                        <span className="text-gray-300">{creator.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-medium">{creator.trackCount} tracks</div>
                        <div className="text-gray-500 text-sm">{creator.totalPlays.toLocaleString()} plays</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="card-bg rounded-2xl p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Performance Metrics</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="border border-gray-800 rounded-xl p-4 sm:p-5">
                <div className="text-gray-400 text-sm mb-1">Avg. Session Duration</div>
                <div className="text-xl sm:text-2xl font-bold text-white">4m 32s</div>
                <div className="text-green-500 text-xs mt-1">↑ 12% from last period</div>
              </div>
              
              <div className="border border-gray-800 rounded-xl p-4 sm:p-5">
                <div className="text-gray-400 text-sm mb-1">Bounce Rate</div>
                <div className="text-xl sm:text-2xl font-bold text-white">24.7%</div>
                <div className="text-green-500 text-xs mt-1">↓ 3.2% from last period</div>
              </div>
              
              <div className="border border-gray-800 rounded-xl p-4 sm:p-5">
                <div className="text-gray-400 text-sm mb-1">Page Views</div>
                <div className="text-xl sm:text-2xl font-bold text-white">128,429</div>
                <div className="text-green-500 text-xs mt-1">↑ 8.4% from last period</div>
              </div>
              
              <div className="border border-gray-800 rounded-xl p-4 sm:p-5">
                <div className="text-gray-400 text-sm mb-1">Conversion Rate</div>
                <div className="text-xl sm:text-2xl font-bold text-white">3.2%</div>
                <div className="text-red-500 text-xs mt-1">↓ 0.8% from last period</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}