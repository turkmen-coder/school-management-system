interface DashboardData {
  crm: {
    totalProspects: number;
    convertedProspects: number;
    conversionRate: number;
  };
  exams: {
    totalExams: number;
    averageScore: number;
    completionRate: number;
  };
  billing: {
    totalStudents: number;
    activeContracts: number;
    monthlyRevenue: number;
    overdueAmount: number;
  };
  payments: {
    monthlyRevenue: number;
    totalCollected: number;
    pendingAmount: number;
  };
}

class ApiService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  async getDashboard(): Promise<DashboardData> {
    try {
      // For now, return mock data since the backend services aren't connected yet
      return this.getMockDashboardData();
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      return this.getMockDashboardData();
    }
  }

  private getMockDashboardData(): DashboardData {
    return {
      crm: {
        totalProspects: 156,
        convertedProspects: 43,
        conversionRate: 27.6,
      },
      exams: {
        totalExams: 24,
        averageScore: 78.5,
        completionRate: 92.3,
      },
      billing: {
        totalStudents: 485,
        activeContracts: 423,
        monthlyRevenue: 245000,
        overdueAmount: 18500,
      },
      payments: {
        monthlyRevenue: 245000,
        totalCollected: 2100000,
        pendingAmount: 52000,
      },
    };
  }

  // Authentication API methods
  async login(credentials: { email: string; password: string }) {
    // TODO: Implement actual API call to IAM service
    // For now, simulate API call with timeout
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (credentials.email === 'admin@school.com' && credentials.password === 'admin123') {
      return {
        user: {
          id: '1',
          name: 'Admin Kullanıcı',
          email: credentials.email,
          role: 'admin'
        },
        token: `mock-jwt-token-${Date.now()}`
      };
    }
    
    throw new Error('Geçersiz kullanıcı adı veya şifre');
  }

  async logout() {
    // TODO: Implement actual API call to invalidate token
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
  }

  async validateToken(token: string) {
    // TODO: Implement actual token validation
    await new Promise(resolve => setTimeout(resolve, 300));
    return token.startsWith('mock-jwt-token-');
  }
}

export const apiService = new ApiService();

// Specific API modules
export const dashboardApi = {
  getDashboard: () => apiService.getDashboard(),
};

export const authApi = {
  login: (credentials: { email: string; password: string }) => 
    apiService.login(credentials),
  logout: () => apiService.logout(),
  validateToken: (token: string) => apiService.validateToken(token),
};