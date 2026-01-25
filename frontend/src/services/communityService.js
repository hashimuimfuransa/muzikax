// Using environment variable for API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Community Post Services
export const communityPostService = {
  // Create a new community post
  createPost: async (postData) => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    
    let response = await fetch(`${API_BASE_URL}/api/community/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(postData)
    });
    
    // If the response is 401 (Unauthorized), try to refresh the token
    if (response.status === 401) {
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
          });
          
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            localStorage.setItem('accessToken', refreshData.accessToken);
            
            // Retry the original request with the new token
            response = await fetch(`${API_BASE_URL}/api/community/posts`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${refreshData.accessToken}`
              },
              body: JSON.stringify(postData)
            });
          }
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
      }
    }
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create post');
    }

    return response.json();
  },

  // Get all community posts
  getPosts: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    
    let response = await fetch(`${API_BASE_URL}/api/community/posts?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    // If the response is 401 (Unauthorized), try to refresh the token
    if (response.status === 401) {
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
          });
          
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            localStorage.setItem('accessToken', refreshData.accessToken);
            
            // Retry the original request with the new token
            response = await fetch(`${API_BASE_URL}/api/community/posts?${params}`, {
              headers: {
                'Authorization': `Bearer ${refreshData.accessToken}`
              }
            });
          }
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
      }
    }
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch posts');
    }

    return response.json();
  },

  // Get trending posts
  getTrendingPosts: async (period = 'week', limit = 10) => {
    // This is a public endpoint, no token needed
    const response = await fetch(`${API_BASE_URL}/api/community/posts/trending?period=${period}&limit=${limit}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch trending posts');
    }

    return response.json();
  },

  // Get post by ID
  getPostById: async (postId) => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    
    let response = await fetch(`${API_BASE_URL}/api/community/posts/${postId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    // If the response is 401 (Unauthorized), try to refresh the token
    if (response.status === 401) {
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
          });
          
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            localStorage.setItem('accessToken', refreshData.accessToken);
            
            // Retry the original request with the new token
            response = await fetch(`${API_BASE_URL}/api/community/posts/${postId}`, {
              headers: {
                'Authorization': `Bearer ${refreshData.accessToken}`
              }
            });
          }
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
      }
    }
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch post');
    }

    return response.json();
  },

  // Like/unlike a post
  likePost: async (postId) => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    
    let response = await fetch(`${API_BASE_URL}/api/community/posts/${postId}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    // If the response is 401 (Unauthorized), try to refresh the token
    if (response.status === 401) {
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
          });
          
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            localStorage.setItem('accessToken', refreshData.accessToken);
            
            // Retry the original request with the new token
            response = await fetch(`${API_BASE_URL}/api/community/posts/${postId}/like`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${refreshData.accessToken}`
              }
            });
          }
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
      }
    }
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to like post');
    }

    return response.json();
  },

  // Share a post
  sharePost: async (postId) => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    
    let response = await fetch(`${API_BASE_URL}/api/community/posts/${postId}/share`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    // If the response is 401 (Unauthorized), try to refresh the token
    if (response.status === 401) {
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
          });
          
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            localStorage.setItem('accessToken', refreshData.accessToken);
            
            // Retry the original request with the new token
            response = await fetch(`${API_BASE_URL}/api/community/posts/${postId}/share`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${refreshData.accessToken}`
              }
            });
          }
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
      }
    }
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to share post');
    }

    return response.json();
  },

  // View a post
  viewPost: async (postId) => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    
    let response = await fetch(`${API_BASE_URL}/api/community/posts/${postId}/view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    // If the response is 401 (Unauthorized), try to refresh the token
    if (response.status === 401) {
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
          });
          
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            localStorage.setItem('accessToken', refreshData.accessToken);
            
            // Retry the original request with the new token
            response = await fetch(`${API_BASE_URL}/api/community/posts/${postId}/view`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${refreshData.accessToken}`
              }
            });
          }
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
      }
    }
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to view post');
    }

    return response.json();
  },

  // Create a poll for a post
  createPoll: async (postId, pollOptions, pollEndsAt) => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    
    let response = await fetch(`${API_BASE_URL}/api/community/posts/${postId}/poll`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ pollOptions, pollEndsAt })
    });
    
    // If the response is 401 (Unauthorized), try to refresh the token
    if (response.status === 401) {
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
          });
          
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            localStorage.setItem('accessToken', refreshData.accessToken);
            
            // Retry the original request with the new token
            response = await fetch(`${API_BASE_URL}/api/community/posts/${postId}/poll`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${refreshData.accessToken}`
              },
              body: JSON.stringify({ pollOptions, pollEndsAt })
            });
          }
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
      }
    }
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create poll');
    }

    return response.json();
  },

  // Vote in a poll
  voteInPoll: async (postId, optionIndex) => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    
    let response = await fetch(`${API_BASE_URL}/api/community/posts/${postId}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ optionIndex })
    });
    
    // If the response is 401 (Unauthorized), try to refresh the token
    if (response.status === 401) {
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
          });
          
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            localStorage.setItem('accessToken', refreshData.accessToken);
            
            // Retry the original request with the new token
            response = await fetch(`${API_BASE_URL}/api/community/posts/${postId}/vote`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${refreshData.accessToken}`
              },
              body: JSON.stringify({ optionIndex })
            });
          }
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
      }
    }
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to vote in poll');
    }

    return response.json();
  }
};

// Community Comment Services
export const communityCommentService = {
  // Add a comment to a community post
  addComment: async (postId, text, parentId = null) => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    
    let response = await fetch(`${API_BASE_URL}/api/community/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ postId, text, parentId })
    });
    
    // If the response is 401 (Unauthorized), try to refresh the token
    if (response.status === 401) {
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
          });
          
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            localStorage.setItem('accessToken', refreshData.accessToken);
            
            // Retry the original request with the new token
            response = await fetch(`${API_BASE_URL}/api/community/comments`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${refreshData.accessToken}`
              },
              body: JSON.stringify({ postId, text, parentId })
            });
          }
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
      }
    }
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to add comment');
    }

    return response.json();
  },

  // Get comments for a community post
  getComments: async (postId, options = {}) => {
    const { limit = 20, offset = 0, sortBy = 'createdAt', sortOrder = 'desc', includeReplies = true } = options;
    const params = new URLSearchParams({
      limit,
      offset,
      sortBy,
      sortOrder,
      includeReplies
    });
    
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    
    let response = await fetch(`${API_BASE_URL}/api/community/comments/post/${postId}?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    // If the response is 401 (Unauthorized), try to refresh the token
    if (response.status === 401) {
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
          });
          
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            localStorage.setItem('accessToken', refreshData.accessToken);
            
            // Retry the original request with the new token
            response = await fetch(`${API_BASE_URL}/api/community/comments/post/${postId}?${params}`, {
              headers: {
                'Authorization': `Bearer ${refreshData.accessToken}`
              }
            });
          }
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
      }
    }
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch comments');
    }

    return response.json();
  },

  // Like/unlike a comment
  likeComment: async (commentId) => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    
    let response = await fetch(`${API_BASE_URL}/api/community/comments/${commentId}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    // If the response is 401 (Unauthorized), try to refresh the token
    if (response.status === 401) {
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
          });
          
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            localStorage.setItem('accessToken', refreshData.accessToken);
            
            // Retry the original request with the new token
            response = await fetch(`${API_BASE_URL}/api/community/comments/${commentId}/like`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${refreshData.accessToken}`
              }
            });
          }
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
      }
    }
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to like comment');
    }

    return response.json();
  },

  // Report a comment
  reportComment: async (commentId, reason) => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    
    let response = await fetch(`${API_BASE_URL}/api/community/comments/${commentId}/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ reason })
    });
    
    // If the response is 401 (Unauthorized), try to refresh the token
    if (response.status === 401) {
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
          });
          
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            localStorage.setItem('accessToken', refreshData.accessToken);
            
            // Retry the original request with the new token
            response = await fetch(`${API_BASE_URL}/api/community/comments/${commentId}/report`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${refreshData.accessToken}`
              },
              body: JSON.stringify({ reason })
            });
          }
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
      }
    }
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to report comment');
    }

    return response.json();
  },

  // Delete a comment
  deleteComment: async (commentId) => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    
    let response = await fetch(`${API_BASE_URL}/api/community/comments/${commentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    // If the response is 401 (Unauthorized), try to refresh the token
    if (response.status === 401) {
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
          });
          
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            localStorage.setItem('accessToken', refreshData.accessToken);
            
            // Retry the original request with the new token
            response = await fetch(`${API_BASE_URL}/api/community/comments/${commentId}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${refreshData.accessToken}`
              }
            });
          }
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
      }
    }
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete comment');
    }

    return response.json();
  }
};

// Circle Services
export const circleService = {
  // Create a new circle
  createCircle: async (circleData) => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    
    let response = await fetch(`${API_BASE_URL}/api/community/circles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(circleData)
    });
    
    // If the response is 401 (Unauthorized), try to refresh the token
    if (response.status === 401) {
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
          });
          
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            localStorage.setItem('accessToken', refreshData.accessToken);
            
            // Retry the original request with the new token
            response = await fetch(`${API_BASE_URL}/api/community/circles`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${refreshData.accessToken}`
              },
              body: JSON.stringify(circleData)
            });
          }
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
      }
    }
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create circle');
    }

    return response.json();
  },

  // Get all circles
  getCircles: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    // This is a public endpoint, no token needed
    const response = await fetch(`${API_BASE_URL}/api/community/circles?${params}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch circles');
    }

    return response.json();
  },

  // Get circle by ID
  getCircleById: async (circleId) => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    
    let response = await fetch(`${API_BASE_URL}/api/community/circles/${circleId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    // If the response is 401 (Unauthorized), try to refresh the token
    if (response.status === 401) {
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
          });
          
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            localStorage.setItem('accessToken', refreshData.accessToken);
            
            // Retry the original request with the new token
            response = await fetch(`${API_BASE_URL}/api/community/circles/${circleId}`, {
              headers: {
                'Authorization': `Bearer ${refreshData.accessToken}`
              }
            });
          }
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
      }
    }
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch circle');
    }

    return response.json();
  },

  // Get posts in a circle
  getCirclePosts: async (circleId, options = {}) => {
    const { limit = 20, offset = 0, sortBy = 'createdAt', sortOrder = 'desc' } = options;
    const params = new URLSearchParams({
      limit,
      offset,
      sortBy,
      sortOrder
    });
    
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    
    let response = await fetch(`${API_BASE_URL}/api/community/circles/${circleId}/posts?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    // If the response is 401 (Unauthorized), try to refresh the token
    if (response.status === 401) {
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
          });
          
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            localStorage.setItem('accessToken', refreshData.accessToken);
            
            // Retry the original request with the new token
            response = await fetch(`${API_BASE_URL}/api/community/circles/${circleId}/posts?${params}`, {
              headers: {
                'Authorization': `Bearer ${refreshData.accessToken}`
              }
            });
          }
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
      }
    }
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch circle posts');
    }

    return response.json();
  },

  // Join a circle
  joinCircle: async (circleId) => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    
    let response = await fetch(`${API_BASE_URL}/api/community/circles/${circleId}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    // If the response is 401 (Unauthorized), try to refresh the token
    if (response.status === 401) {
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
          });
          
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            localStorage.setItem('accessToken', refreshData.accessToken);
            
            // Retry the original request with the new token
            response = await fetch(`${API_BASE_URL}/api/community/circles/${circleId}/join`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${refreshData.accessToken}`
              }
            });
          }
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
      }
    }
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to join circle');
    }

    return response.json();
  },

  // Leave a circle
  leaveCircle: async (circleId) => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    
    let response = await fetch(`${API_BASE_URL}/api/community/circles/${circleId}/leave`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    // If the response is 401 (Unauthorized), try to refresh the token
    if (response.status === 401) {
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
          });
          
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            localStorage.setItem('accessToken', refreshData.accessToken);
            
            // Retry the original request with the new token
            response = await fetch(`${API_BASE_URL}/api/community/circles/${circleId}/leave`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${refreshData.accessToken}`
              }
            });
          }
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
      }
    }
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to leave circle');
    }

    return response.json();
  }
};

// Challenge Services
export const challengeService = {
  // Create a new challenge
  createChallenge: async (challengeData) => {
    const response = await fetch(`${API_BASE_URL}/api/community/challenges`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(challengeData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create challenge');
    }

    return response.json();
  },

  // Get all challenges
  getChallenges: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE_URL}/api/community/challenges?${params}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch challenges');
    }

    return response.json();
  },

  // Get trending challenges
  getTrendingChallenges: async (period = 'month', limit = 10) => {
    const response = await fetch(`${API_BASE_URL}/api/community/challenges/trending?period=${period}&limit=${limit}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch trending challenges');
    }

    return response.json();
  },

  // Get challenge by ID
  getChallengeById: async (challengeId) => {
    const response = await fetch(`${API_BASE_URL}/api/community/challenges/${challengeId}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch challenge');
    }

    return response.json();
  },

  // Get challenge participants
  getChallengeParticipants: async (challengeId, options = {}) => {
    const { sortBy = 'votes', sortOrder = 'desc' } = options;
    const params = new URLSearchParams({
      sortBy,
      sortOrder
    });
    
    const response = await fetch(`${API_BASE_URL}/api/community/challenges/${challengeId}/participants?${params}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch challenge participants');
    }

    return response.json();
  },

  // Participate in a challenge
  participateInChallenge: async (challengeId, submission) => {
    const response = await fetch(`${API_BASE_URL}/api/community/challenges/${challengeId}/participate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ submission })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to participate in challenge');
    }

    return response.json();
  },

  // Vote in a challenge
  voteInChallenge: async (challengeId, participantId) => {
    const response = await fetch(`${API_BASE_URL}/api/community/challenges/${challengeId}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ participantId })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to vote in challenge');
    }

    return response.json();
  }
};

// Live Room Services
export const liveRoomService = {
  // Create a new live room
  createLiveRoom: async (roomData) => {
    const response = await fetch(`${API_BASE_URL}/api/community/liverooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(roomData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create live room');
    }

    return response.json();
  },

  // Get all live rooms
  getLiveRooms: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE_URL}/api/community/liverooms?${params}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch live rooms');
    }

    return response.json();
  },

  // Get live room by ID
  getLiveRoomById: async (roomId) => {
    const response = await fetch(`${API_BASE_URL}/api/community/liverooms/${roomId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch live room');
    }

    return response.json();
  },

  // Get live rooms for a specific host
  getHostLiveRooms: async (userId, options = {}) => {
    const { limit = 20, offset = 0, sortBy = 'createdAt', sortOrder = 'desc' } = options;
    const params = new URLSearchParams({
      limit,
      offset,
      sortBy,
      sortOrder
    });
    
    const response = await fetch(`${API_BASE_URL}/api/community/liverooms/host/${userId}?${params}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch host live rooms');
    }

    return response.json();
  },

  // Join a live room
  joinLiveRoom: async (roomId) => {
    const response = await fetch(`${API_BASE_URL}/api/community/liverooms/${roomId}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to join live room');
    }

    return response.json();
  },

  // Leave a live room
  leaveLiveRoom: async (roomId) => {
    const response = await fetch(`${API_BASE_URL}/api/community/liverooms/${roomId}/leave`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to leave live room');
    }

    return response.json();
  },

  // Start a live room
  startLiveRoom: async (roomId) => {
    const response = await fetch(`${API_BASE_URL}/api/community/liverooms/${roomId}/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to start live room');
    }

    return response.json();
  },

  // End a live room
  endLiveRoom: async (roomId) => {
    const response = await fetch(`${API_BASE_URL}/api/community/liverooms/${roomId}/end`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to end live room');
    }

    return response.json();
  },

  // Send chat message in live room
  sendChatMessage: async (roomId, text) => {
    const response = await fetch(`${API_BASE_URL}/api/community/liverooms/${roomId}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ text })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send chat message');
    }

    return response.json();
  }
};