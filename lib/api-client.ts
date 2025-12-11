const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://task-hub-oq63.onrender.com';

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  setToken(token: string | null) {
    if (typeof window === 'undefined') return;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      // Log warning if no token for protected endpoints (except auth endpoints)
      if (!endpoint.includes('/auth/') && typeof window !== 'undefined') {
        console.warn(`No token available for request to ${endpoint}`);
      }
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle 401 Unauthorized specifically
      if (response.status === 401) {
        // Clear token on unauthorized
        this.setToken(null);
        const errorData = await response.json().catch(() => ({ message: 'Unauthorized' }));
        const error = new Error(errorData.message || 'Unauthorized');
        (error as any).status = 401;
        throw error;
      }

      // Try to parse JSON, but handle cases where response might not be JSON
      let data: ApiResponse<T>;
      try {
        data = await response.json();
      } catch (parseError) {
        // If JSON parsing fails, create a generic error response
        if (!response.ok) {
          const error = new Error(`Request failed with status ${response.status}`);
          (error as any).status = response.status;
          throw error;
        }
        // If response is ok but not JSON, return a success response
        return { success: true } as ApiResponse<T>;
      }

      if (!response.ok) {
        const error = new Error(data.message || `Request failed with status ${response.status}`);
        (error as any).status = response.status;
        throw error;
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  // Auth methods
  async signup(data: { name: string; email: string; password: string; title?: string }) {
    return this.request('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async signin(data: { email: string; password: string }) {
    const response = await this.request<{
      user: any;
      token: string;
    }>('/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    // Handle different response structures
    // Check response.data.token first (standard structure)
    // Then check response.token (alternative structure)
    // Then check response.data directly if it's a string
    const token = response.data?.token || 
                  (response as any).token || 
                  (typeof response.data === 'string' ? response.data : null);
    
    if (token) {
      this.setToken(token);
      // Verify token was stored
      const storedToken = this.getToken();
      if (!storedToken) {
        console.error('Failed to store token in localStorage');
      }
    } else {
      console.warn('No token received in signin response. Response structure:', response);
    }
    
    return response;
  }

  async logout() {
    const response = await this.request('/api/auth/logout', {
      method: 'POST',
    });
    this.setToken(null);
    return response;
  }

  async getCurrentUser() {
    return this.request('/api/auth/me');
  }

  // Task methods
  async getTasks(filters?: {
    date?: string;
    month?: string;
    status?: string;
    priority?: string;
  }) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    const queryString = params.toString();
    return this.request<{ tasks: any[] }>(`/api/tasks${queryString ? `?${queryString}` : ''}`);
  }

  async getTask(id: string) {
    return this.request(`/api/tasks/${id}`);
  }

  async createTask(data: {
    title: string;
    description?: string;
    priority?: 'low' | 'medium' | 'high';
    date: string;
    timeStart?: string;
    timeEnd?: string;
    time?: string;
    referenceLinks?: string[];
  }) {
    return this.request('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTask(id: string, data: Partial<{
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    date: string;
    timeStart: string;
    timeEnd: string;
    time: string;
    referenceLinks: string[];
    completed: boolean;
  }>) {
    return this.request(`/api/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTask(id: string) {
    return this.request(`/api/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleTaskCompletion(id: string) {
    return this.request(`/api/tasks/${id}/complete`, {
      method: 'PATCH',
    });
  }

  // Analytics methods
  async getAnalyticsOverview(month?: string) {
    const params = month ? `?month=${month}` : '';
    return this.request(`/api/analytics/overview${params}`);
  }

  async getTaskStatus(month?: string) {
    const params = month ? `?month=${month}` : '';
    return this.request(`/api/analytics/task-status${params}`);
  }

  async getWeeklyDistribution(week?: string) {
    const params = week ? `?week=${week}` : '';
    return this.request(`/api/analytics/weekly-distribution${params}`);
  }

  async getPriorityDistribution(month?: string) {
    const params = month ? `?month=${month}` : '';
    return this.request(`/api/analytics/priority-distribution${params}`);
  }

  async getMonthlyTrend(months?: number) {
    const params = months ? `?months=${months}` : '';
    return this.request(`/api/analytics/monthly-trend${params}`);
  }

  // User methods
  async getProfile() {
    return this.request('/api/user/profile');
  }

  async updateProfile(data: { name?: string; title?: string }) {
    return this.request('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async changePassword(data: { currentPassword: string; newPassword: string }) {
    return this.request('/api/user/password', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // AI methods
  async aiChat(message: string) {
    return this.request<{ response: string }>('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

