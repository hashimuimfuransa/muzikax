'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../contexts/AuthContext'
import AdminSidebar from '../../../components/AdminSidebar'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

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

interface UserRolesStat {
  _id: string
  count: number
  [key: string]: any;
}

interface CreatorTypesStat {
  _id: string
  count: number
  [key: string]: any;
}

interface TracksByType {
  _id: string
  count: number
  [key: string]: any;
}

interface TracksByGenre {
  _id: string
  count: number
  [key: string]: any;
}

interface MostPlayedTrack {
  id: string
  title: string
  creator: string
  plays: number
  likes: number
}

interface CountryStat {
  country: string;
  playCount: number;
  uniqueListeners: number;
  percentage: number;
}

interface GeographicData {
  countryStats: CountryStat[];
  totalPlays: number;
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d')
  const [userGrowth, setUserGrowth] = useState<UserGrowthData[]>([])
  const [contentStats, setContentStats] = useState<ContentStat[]>([])
  const [topCreators, setTopCreators] = useState<TopCreator[]>([])
  const [userRoles, setUserRoles] = useState<UserRolesStat[]>([])
  const [creatorTypes, setCreatorTypes] = useState<CreatorTypesStat[]>([])
  const [tracksByType, setTracksByType] = useState<TracksByType[]>([])
  const [tracksByGenre, setTracksByGenre] = useState<TracksByGenre[]>([])
  const [mostPlayedTracks, setMostPlayedTracks] = useState<MostPlayedTrack[]>([])
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalCreators, setTotalCreators] = useState(0);
  const [totalAdmins, setTotalAdmins] = useState(0);
  const [totalTracks, setTotalTracks] = useState(0);
  const [totalPlays, setTotalPlays] = useState(0);
  const [geographicData, setGeographicData] = useState<GeographicData | null>(null);
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
      
      // Fetch all analytics data
      const [platformStatsResponse, userStatsResponse, contentStatsResponse, analyticsResponse, geographicResponse] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/platform-stats`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/user-stats`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/content-stats`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/analytics`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/geographic-distribution`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        })
      ]);
      
      if (!platformStatsResponse.ok || !userStatsResponse.ok || !contentStatsResponse.ok || !analyticsResponse.ok || !geographicResponse.ok) {
        throw new Error('Failed to fetch analytics data')
      }
      
      const platformStats = await platformStatsResponse.json();
      const userStats = await userStatsResponse.json();
      const contentStatsData = await contentStatsResponse.json();
      const analyticsData = await analyticsResponse.json();
      const geographicDataRes = await geographicResponse.json();
      
      setUserGrowth(platformStats.userGrowth);
      setTopCreators(platformStats.topCreators);
      setContentStats(platformStats.contentStats);
      setUserRoles(userStats.userRoles);
      setCreatorTypes(userStats.creatorTypes);
      setTracksByType(contentStatsData.tracksByType);
      setTracksByGenre(contentStatsData.tracksByGenre);
      setMostPlayedTracks(contentStatsData.mostPlayedTracks);
      setTotalUsers(analyticsData.totalUsers);
      setTotalCreators(analyticsData.totalCreators);
      setTotalAdmins(analyticsData.totalAdmins);
      setTotalTracks(analyticsData.totalTracks);
      setTotalPlays(analyticsData.totalPlays);
      setGeographicData(geographicDataRes);
      
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

  // Prepare data for charts
  const userRoleColors = ['#FF4D67', '#FFCB2B', '#6366F1'];
  const creatorTypeColors = ['#10B981', '#8B5CF6', '#EC4899'];
  const trackTypeColors = ['#3B82F6', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6'];

  // Stats cards data
  const statsCards = [
    { title: 'Total Users', value: totalUsers.toLocaleString(), change: '+12%', icon: 'users', color: 'from-[#FF4D67] to-[#FF4D67]' },
    { title: 'Total Creators', value: totalCreators.toLocaleString(), change: '+8%', icon: 'creator', color: 'from-[#FFCB2B] to-[#FFCB2B]' },
    { title: 'Total Tracks', value: totalTracks.toLocaleString(), change: '+15%', icon: 'music', color: 'from-[#6366F1] to-[#6366F1]' },
    { title: 'Total Plays', value: totalPlays.toLocaleString(), change: '+18%', icon: 'play', color: 'from-[#10B981] to-[#10B981]' },
  ];

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

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {statsCards.map((stat, index) => (
              <div key={index} className="card-bg rounded-2xl p-4 sm:p-6 transition-all duration-300 hover:border-[#FF4D67]/50 hover:bg-gradient-to-br hover:from-gray-900/70 hover:to-gray-900/50 hover:shadow-xl hover:shadow-[#FF4D67]/10">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-400 text-xs sm:text-sm mb-1">{stat.title}</p>
                    <p className="text-xl sm:text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs sm:text-sm text-green-500 mt-1">{stat.change} from last period</p>
                  </div>
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <div className="text-white">
                      {stat.icon === 'users' && (
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                        </svg>
                      )}
                      {stat.icon === 'creator' && (
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                        </svg>
                      )}
                      {stat.icon === 'music' && (
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
                        </svg>
                      )}
                      {stat.icon === 'play' && (
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
            {/* User Growth Chart */}
            <div className="card-bg rounded-2xl p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">User Growth</h2>
              
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF4D67]"></div>
                </div>
              ) : error ? (
                <div className="text-red-500 text-center py-8">{error}</div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis 
                      dataKey="_id" 
                      tick={{ fill: '#9CA3AF', fontSize: 12 }}
                      tickFormatter={(value: string) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis 
                      tick={{ fill: '#9CA3AF', fontSize: 12 }}
                      tickFormatter={(value: number) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value.toString()}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', borderRadius: '0.5rem' }}
                      itemStyle={{ color: 'white' }}
                      formatter={(value: number | undefined) => [value || 0, 'Users']}
                      labelFormatter={(label) => `Date: ${new Date(label).toLocaleDateString()}`}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#FF4D67" 
                      fill="url(#colorGradient)" 
                      strokeWidth={2}
                    />
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF4D67" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#FF4D67" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* User Roles Distribution */}
            <div className="card-bg rounded-2xl p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">User Roles Distribution</h2>
              
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF4D67]"></div>
                </div>
              ) : error ? (
                <div className="text-red-500 text-center py-8">{error}</div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={userRoles}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                      label={(props) => {
                        const { name, percent } = props;
                        return `${name || 'Unknown'}: ${percent ? (percent * 100).toFixed(0) : '0'}%`;
                      }}
                    >
                      {userRoles.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={userRoleColors[index % userRoleColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', borderRadius: '0.5rem' }}
                      itemStyle={{ color: 'white' }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
            {/* Content Types */}
            <div className="card-bg rounded-2xl p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Content Distribution by Type</h2>
              
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF4D67]"></div>
                </div>
              ) : error ? (
                <div className="text-red-500 text-center py-8">{error}</div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={tracksByType}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis 
                      dataKey="_id" 
                      tick={{ fill: '#9CA3AF', fontSize: 12 }}
                    />
                    <YAxis 
                      tick={{ fill: '#9CA3AF', fontSize: 12 }}
                      tickFormatter={(value: number) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value.toString()}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', borderRadius: '0.5rem' }}
                      itemStyle={{ color: 'white' }}
                    />
                    <Legend />
                    <Bar dataKey="count" name="Track Count" fill="#6366F1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Top Creators */}
            <div className="card-bg rounded-2xl p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Top Creators by Plays</h2>
              
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF4D67]"></div>
                </div>
              ) : error ? (
                <div className="text-red-500 text-center py-8">{error}</div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={topCreators.slice(0, 10)}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis 
                      type="number" 
                      tick={{ fill: '#9CA3AF', fontSize: 12 }}
                      tickFormatter={(value: number) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value.toString()}
                    />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      tick={{ fill: '#9CA3AF', fontSize: 12 }}
                      width={90}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', borderRadius: '0.5rem' }}
                      itemStyle={{ color: 'white' }}
                      formatter={(value: number | undefined) => [value ? value.toLocaleString() : '0', 'Plays']}
                    />
                    <Bar dataKey="totalPlays" name="Plays" fill="#FF4D67" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Bottom Section - Most Played Tracks and Creator Types */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
            {/* Most Played Tracks */}
            <div className="card-bg rounded-2xl p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Most Played Tracks</h2>
              
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF4D67]"></div>
                </div>
              ) : error ? (
                <div className="text-red-500 text-center py-8">{error}</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-gray-500 text-xs sm:text-sm border-b border-gray-800">
                        <th className="pb-3 font-normal">Rank</th>
                        <th className="pb-3 font-normal">Track</th>
                        <th className="pb-3 font-normal">Creator</th>
                        <th className="pb-3 font-normal">Plays</th>
                        <th className="pb-3 font-normal">Likes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {mostPlayedTracks.slice(0, 10).map((track, index) => (
                        <tr key={track.id} className="hover:bg-gray-800/30 transition-colors">
                          <td className="py-3 sm:py-4">
                            <div className="font-medium text-white text-sm sm:text-base">{index + 1}</div>
                          </td>
                          <td className="py-3 sm:py-4">
                            <div className="font-medium text-white text-sm sm:text-base">{track.title}</div>
                          </td>
                          <td className="py-3 sm:py-4 text-gray-400 text-sm">
                            {track.creator}
                          </td>
                          <td className="py-3 sm:py-4 text-gray-400 text-sm">
                            {track.plays.toLocaleString()}
                          </td>
                          <td className="py-3 sm:py-4 text-gray-400 text-sm">
                            {track.likes.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Creator Types Distribution */}
            <div className="card-bg rounded-2xl p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Creator Types Distribution</h2>
              
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF4D67]"></div>
                </div>
              ) : error ? (
                <div className="text-red-500 text-center py-8">{error}</div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={creatorTypes}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                      label={(props) => {
                        const { name, percent } = props;
                        return `${name || 'Unknown'}: ${percent ? (percent * 100).toFixed(0) : '0'}%`;
                      }}
                    >
                      {creatorTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={creatorTypeColors[index % creatorTypeColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', borderRadius: '0.5rem' }}
                      itemStyle={{ color: 'white' }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Geographic Distribution */}
          <div className="card-bg rounded-2xl p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Geographic Distribution of Listeners</h2>
            
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF4D67]"></div>
              </div>
            ) : error ? (
              <div className="text-red-500 text-center py-8">{error}</div>
            ) : geographicData ? (
              <div className="overflow-x-auto">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={geographicData.countryStats}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis 
                      dataKey="country" 
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      tick={{ fill: '#9CA3AF', fontSize: 12 }}
                    />
                    <YAxis 
                      tick={{ fill: '#9CA3AF', fontSize: 12 }}
                      tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', borderRadius: '0.5rem' }}
                      itemStyle={{ color: 'white' }}
                      formatter={(value, name) => {
                        if (name === 'playCount') {
                          return [value, 'Plays'];
                        } else if (name === 'uniqueListeners') {
                          return [value, 'Unique Listeners'];
                        } else if (name === 'percentage') {
                          return [`${value}%`, 'Percentage'];
                        }
                        return [value, name];
                      }}
                      labelFormatter={(value) => `Country: ${value}`}
                    />
                    <Legend />
                    <Bar dataKey="playCount" name="Play Count" fill="#FF4D67" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="uniqueListeners" name="Unique Listeners" fill="#6366F1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                
                {/* Additional geographic metrics table */}
                <div className="mt-6 overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-gray-500 text-xs sm:text-sm border-b border-gray-800">
                        <th className="pb-3 font-normal">Country</th>
                        <th className="pb-3 font-normal">Plays</th>
                        <th className="pb-3 font-normal">Unique Listeners</th>
                        <th className="pb-3 font-normal">Percentage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {geographicData.countryStats.map((stat, index) => (
                        <tr key={index} className="hover:bg-gray-800/30 transition-colors">
                          <td className="py-3 sm:py-4">
                            <div className="font-medium text-white text-sm sm:text-base">{stat.country}</div>
                          </td>
                          <td className="py-3 sm:py-4 text-gray-400 text-sm">
                            {stat.playCount.toLocaleString()}
                          </td>
                          <td className="py-3 sm:py-4 text-gray-400 text-sm">
                            {stat.uniqueListeners.toLocaleString()}
                          </td>
                          <td className="py-3 sm:py-4 text-gray-400 text-sm">
                            {stat.percentage}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-center py-8">No geographic data available</div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}