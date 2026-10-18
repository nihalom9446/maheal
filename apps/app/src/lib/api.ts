import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { storage } from './storage';
import {
  SendOtpDto,
  VerifyOtpDto,
  User,
  FamilyDetail,
  FamilyPirivuStatus,
  AnnouncementListItem,
  DeathRecordListItem,
  TodayPrayerTimesDto,
  PrayerMonthTimesDto,
} from '@maheall/shared';
declare const process: { env?: { EXPO_PUBLIC_API_URL?: string } };
const API_BASE_URL = process?.env?.EXPO_PUBLIC_API_URL || 'http://192.168.20.13:3001/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor: Attach Authorization and Tenant headers
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await storage.getAccessToken();
    const mahalId = await storage.getMahalId();

    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    if (mahalId) {
      config.headers.set('x-mahal-id', mahalId);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor: Handle 401s and token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (typeof token === 'string') {
              originalRequest.headers.set('Authorization', `Bearer ${token}`);
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await storage.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const res = await axios.post<{ success: boolean; data: { accessToken: string } }>(
          `${API_BASE_URL}/auth/refresh`,
          {},
          {
            headers: {
              Authorization: `Bearer ${await storage.getAccessToken()}`,
              Cookie: `refresh_token=${refreshToken}`,
            },
          },
        );

        if (res.data?.data?.accessToken) {
          const newAccessToken = res.data.data.accessToken;
          await storage.setAccessToken(newAccessToken);
          processQueue(null, newAccessToken);
          originalRequest.headers.set('Authorization', `Bearer ${newAccessToken}`);
          return apiClient(originalRequest);
        } else {
          throw new Error('Refresh failed');
        }
      } catch (refreshErr) {
        processQueue(refreshErr as AxiosError, null);
        await storage.clearAuth();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

// Typed API Client Methods for MAHEALL Mobile App
export const api = {
  // Auth Endpoints
  auth: {
    sendOtp: async (dto: SendOtpDto): Promise<{ message: string; expiresInSeconds?: number }> => {
      const response = await apiClient.post('/auth/send-otp', dto);
      return response.data;
    },

    verifyOtp: async (
      dto: VerifyOtpDto,
    ): Promise<{
      accessToken: string;
      refreshToken?: string;
      user: User;
      requiresConsent: boolean;
      mahal_id?: string;
    }> => {
      const response = await apiClient.post('/auth/verify-otp', dto);
      return response.data.data;
    },

    recordConsent: async (): Promise<{ success: boolean; message: string }> => {
      const response = await apiClient.post('/auth/consent');
      return response.data;
    },

    logout: async (): Promise<void> => {
      try {
        await apiClient.post('/auth/logout');
      } finally {
        await storage.clearAuth();
      }
    },

    getMe: async (): Promise<{ id: string; phone: string; mahal_id: string; roles: string[] }> => {
      const response = await apiClient.get('/auth/me');
      return response.data.data;
    },
  },

  // Prayer Timetable
  prayer: {
    getToday: async (date?: string): Promise<TodayPrayerTimesDto> => {
      const response = await apiClient.get('/prayers/today', {
        params: { date },
      });
      return response.data.data;
    },

    getMonth: async (year: number, month: number): Promise<PrayerMonthTimesDto> => {
      const response = await apiClient.get('/prayers/month', {
        params: { year, month },
      });
      return response.data.data;
    },

    getSchedule: async () => {
      const response = await apiClient.get('/prayers/schedule');
      return response.data.data;
    },
  },

  // Pirivu (Dues & Collections)
  finance: {
    getFamilyPirivuStatus: async (
      familyId: string,
      year?: number,
    ): Promise<FamilyPirivuStatus> => {
      const response = await apiClient.get(`/finance/pirivu/family/${familyId}/status`, {
        params: { year },
      });
      return response.data.data;
    },
  },

  // Announcements & Demise Notices
  announcements: {
    list: async (params?: {
      category?: string;
      page?: number;
      limit?: number;
    }): Promise<{
      data: AnnouncementListItem[];
      total: number;
      page: number;
      totalPages: number;
    }> => {
      const response = await apiClient.get('/announcements', {
        params: {
          ...params,
          status: 'PUBLISHED',
        },
      });
      return response.data;
    },

    getDetail: async (id: string): Promise<AnnouncementListItem> => {
      const response = await apiClient.get(`/announcements/${id}`);
      return response.data.data;
    },

    listJanazah: async (params?: {
      page?: number;
      limit?: number;
    }): Promise<{
      data: DeathRecordListItem[];
      total: number;
      page: number;
      totalPages: number;
    }> => {
      const response = await apiClient.get('/announcements/deaths', {
        params,
      });
      return response.data;
    },
  },

  // Family & Member Profile
  family: {
    getDetail: async (familyId: string): Promise<FamilyDetail> => {
      const response = await apiClient.get(`/families/${familyId}`);
      return response.data.data;
    },
  },
};
