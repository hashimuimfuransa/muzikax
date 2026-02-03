'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../contexts/AuthContext'
import AdminSidebar from '../../../components/AdminSidebar'

interface User {
  id: string
  name: string
  email: string
  role: string
  creatorType?: string
  createdAt: string
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
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
        fetchUsers()
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [isAuthenticated, userRole, router, currentPage, searchQuery, roleFilter])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      
      // Build query parameters
      const params = new URLSearchParams()
      params.append('page', currentPage.toString())
      params.append('limit', '10')
      
      if (searchQuery) {
        params.append('query', searchQuery)
      }
      
      if (roleFilter !== 'all') {
        params.append('role', roleFilter)
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/search?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }
      
      const data = await response.json()
      setUsers(data.users)
      setFilteredUsers(data.users)
      setTotalPages(data.pages)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching users:', err)
      setError('Failed to fetch users')
      setLoading(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!userToDelete) return
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete user')
      }
      
      // Refresh the user list
      fetchUsers()
      setShowDeleteModal(false)
      setUserToDelete(null)
    } catch (err) {
      console.error('Error deleting user:', err)
      setError('Failed to delete user')
    }
  }

  const openDeleteModal = (user: User) => {
    setUserToDelete(user)
    setShowDeleteModal(true)
  }

  const closeDeleteModal = () => {
    setShowDeleteModal(false)
    setUserToDelete(null)
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
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">User Management</h1>
            <p className="text-gray-400 text-sm sm:text-base">Manage platform users and their roles</p>
          </div>

          {/* Search and Filter Controls */}
          <div className="card-bg rounded-2xl p-4 sm:p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="search" className="block text-sm font-medium text-gray-400 mb-1">
                  Search Users
                </label>
                <input
                  type="text"
                  id="search"
                  placeholder="Search by name or email..."
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF4D67]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="role-filter" className="block text-sm font-medium text-gray-400 mb-1">
                  Filter by Role
                </label>
                <select
                  id="role-filter"
                  className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FF4D67]"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="all">All Roles</option>
                  <option value="fan">Fan</option>
                  <option value="creator">Creator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="card-bg rounded-2xl p-4 sm:p-6">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF4D67]"></div>
              </div>
            ) : error ? (
              <div className="text-red-500 text-center py-8">{error}</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-gray-500 text-sm border-b border-gray-800">
                        <th className="pb-4 font-normal">User</th>
                        <th className="pb-4 font-normal">Email</th>
                        <th className="pb-4 font-normal">Role</th>
                        <th className="pb-4 font-normal">Joined</th>
                        <th className="pb-4 font-normal">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-800/30 transition-colors">
                          <td className="py-4">
                            <div className="font-medium text-white">{user.name}</div>
                          </td>
                          <td className="py-4 text-gray-400">{user.email}</td>
                          <td className="py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.role === 'admin' 
                                ? 'bg-purple-500/20 text-purple-400' 
                                : user.role === 'creator' 
                                  ? 'bg-blue-500/20 text-blue-400' 
                                  : 'bg-gray-500/20 text-gray-400'
                            }`}>
                              {user.role}
                              {user.creatorType && ` (${user.creatorType})`}
                            </span>
                          </td>
                          <td className="py-4 text-gray-400">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-4">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => router.push(`/admin/users/${user.id}`)}
                                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
                              >
                                Edit
                              </button>
                              {user.role !== 'admin' && (
                                <button
                                  onClick={() => openDeleteModal(user)}
                                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-800">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded-lg ${
                        currentPage === 1 
                          ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                          : 'bg-gray-700 hover:bg-gray-600 text-white'
                      }`}
                    >
                      Previous
                    </button>
                    
                    <div className="text-gray-400 text-sm">
                      Page {currentPage} of {totalPages}
                    </div>
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 rounded-lg ${
                        currentPage === totalPages 
                          ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                          : 'bg-gray-700 hover:bg-gray-600 text-white'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card-bg rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-2">Confirm Deletion</h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete user <span className="text-white font-semibold">{userToDelete.name}</span>? 
              This action cannot be undone and will permanently remove all user data.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}