const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface ArtistEarnings {
  earnings: {
    totalEarnings: number;
    totalWithdrawn: number;
    availableBalance: number;
    completedTransactions: number;
  };
  recentTransactions: Array<{
    _id: string;
    trackId: {
      _id: string;
      title: string;
      coverURL: string;
    };
    buyerId: {
      _id: string;
      name: string;
      email: string;
    };
    amount: number;
    completedDate: string;
  }>;
  withdrawalHistory: Withdrawal[];
  pendingWithdrawals: Withdrawal[];
}

export interface Withdrawal {
  _id: string;
  artistId: string;
  amount: number;
  currency: string;
  mobileNumber: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid' | 'cancelled';
  requestDate: string;
  approvalDate?: string;
  paymentDate?: string;
  approvedBy?: string;
  rejectReason?: string;
  transactionReference?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WithdrawalResponse {
  message: string;
  withdrawal: Withdrawal;
  availableBalance?: number;
}

export interface AllWithdrawalsResponse {
  withdrawals: Withdrawal[];
  summary: {
    totalRequested: number;
    totalApproved: number;
    totalPaid: number;
    totalRejected: number;
  };
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface EarningsDashboard {
  summary: {
    totalPlatformEarnings: number;
    totalWithdrawn: number;
    totalApprovedPending: number;
    totalPendingRequests: number;
    remainingBalance: number;
    totalArtists: number;
    totalTransactions: number;
  };
  topArtists: Array<{
    artist: {
      _id: string;
      name: string;
      email: string;
      whatsappContact?: string;
    };
    totalEarnings: number;
    totalSales: number;
  }>;
  allArtistEarnings: Array<{
    artist: {
      _id: string;
      name: string;
      email: string;
      whatsappContact?: string;
    };
    totalEarnings: number;
    totalSales: number;
  }>;
  withdrawalStats: {
    totalRequests: number;
    pending: number;
    approved: number;
    paid: number;
    rejected: number;
  };
}

// Artist: Request a withdrawal
export const requestWithdrawal = async (amount: number, mobileNumber: string): Promise<WithdrawalResponse> => {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch(`${API_URL}/api/withdrawals/request`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      amount,
      mobileNumber
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to request withdrawal');
  }
  
  return response.json();
};

// Artist: Get earnings and withdrawal history
export const getArtistEarnings = async (): Promise<ArtistEarnings> => {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch(`${API_URL}/api/withdrawals/earnings`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch earnings');
  }
  
  return response.json();
};

// Admin: Get all withdrawals
export const getAllWithdrawals = async (status?: string, page: number = 1, limit: number = 20): Promise<AllWithdrawalsResponse> => {
  const token = localStorage.getItem('accessToken');
  
  let url = `${API_URL}/api/withdrawals?page=${page}&limit=${limit}`;
  if (status) {
    url += `&status=${status}`;
  }
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch withdrawals');
  }
  
  return response.json();
};

// Admin: Approve withdrawal
export const approveWithdrawal = async (withdrawalId: string, notes?: string): Promise<WithdrawalResponse> => {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch(`${API_URL}/api/withdrawals/${withdrawalId}/approve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ notes })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to approve withdrawal');
  }
  
  return response.json();
};

// Admin: Reject withdrawal
export const rejectWithdrawal = async (withdrawalId: string, rejectReason: string): Promise<WithdrawalResponse> => {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch(`${API_URL}/api/withdrawals/${withdrawalId}/reject`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ rejectReason })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to reject withdrawal');
  }
  
  return response.json();
};

// Admin: Mark withdrawal as paid
export const markWithdrawalAsPaid = async (withdrawalId: string, transactionReference?: string): Promise<WithdrawalResponse> => {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch(`${API_URL}/api/withdrawals/${withdrawalId}/mark-paid`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ transactionReference })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to mark withdrawal as paid');
  }
  
  return response.json();
};

// Admin: Get earnings dashboard
export const getEarningsDashboard = async (): Promise<EarningsDashboard> => {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch(`${API_URL}/api/withdrawals/dashboard/earnings`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch earnings dashboard');
  }
  
  return response.json();
};
