import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, FamilyDetail, FamilyPirivuStatus } from '@maheall/shared';

const STORAGE_KEYS = {
  ACCESS_TOKEN: '@maheall:access_token',
  REFRESH_TOKEN: '@maheall:refresh_token',
  USER_PROFILE: '@maheall:user_profile',
  MAHAL_ID: '@maheall:mahal_id',
  MAHAL_INFO: '@maheall:mahal_info',
  FAMILY_DETAILS: '@maheall:family_details',
  PIRIVU_STATUS: '@maheall:pirivu_status',
  DPDPA_CONSENT: '@maheall:dpdpa_consent',
  OFFLINE_PRAYER_CACHE: '@maheall:prayer_cache',
} as const;

export interface MahalInfo {
  id: string;
  name: string;
  name_ml: string | null;
  registration_number?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  secretary_name?: string | null;
  secretary_phone?: string | null;
  secretary_email?: string | null;
}

class StorageService {
  async getAccessToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    } catch {
      return null;
    }
  }

  async setAccessToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
    } catch (e) {
      console.error('Failed to set access token', e);
    }
  }

  async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    } catch {
      return null;
    }
  }

  async setRefreshToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
    } catch (e) {
      console.error('Failed to set refresh token', e);
    }
  }

  async getUser(): Promise<User | null> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }

  async setUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(user));
    } catch (e) {
      console.error('Failed to set user', e);
    }
  }

  async getMahalId(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.MAHAL_ID);
    } catch {
      return null;
    }
  }

  async setMahalId(mahalId: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.MAHAL_ID, mahalId);
    } catch (e) {
      console.error('Failed to set mahal ID', e);
    }
  }

  async getMahalInfo(): Promise<MahalInfo | null> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.MAHAL_INFO);
      return raw ? (JSON.parse(raw) as MahalInfo) : null;
    } catch {
      return null;
    }
  }

  async setMahalInfo(info: MahalInfo): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.MAHAL_INFO, JSON.stringify(info));
    } catch (e) {
      console.error('Failed to set mahal info', e);
    }
  }

  async getFamilyDetails(): Promise<FamilyDetail | null> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.FAMILY_DETAILS);
      return raw ? (JSON.parse(raw) as FamilyDetail) : null;
    } catch {
      return null;
    }
  }

  async setFamilyDetails(family: FamilyDetail): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.FAMILY_DETAILS, JSON.stringify(family));
    } catch (e) {
      console.error('Failed to set family details', e);
    }
  }

  async getPirivuStatus(): Promise<FamilyPirivuStatus | null> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.PIRIVU_STATUS);
      return raw ? (JSON.parse(raw) as FamilyPirivuStatus) : null;
    } catch {
      return null;
    }
  }

  async setPirivuStatus(status: FamilyPirivuStatus): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PIRIVU_STATUS, JSON.stringify(status));
    } catch (e) {
      console.error('Failed to set pirivu status', e);
    }
  }

  async hasDpdpaConsent(): Promise<boolean> {
    try {
      const val = await AsyncStorage.getItem(STORAGE_KEYS.DPDPA_CONSENT);
      return val === 'true';
    } catch {
      return false;
    }
  }

  async setDpdpaConsent(agreed: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.DPDPA_CONSENT, agreed ? 'true' : 'false');
    } catch (e) {
      console.error('Failed to set DPDPA consent', e);
    }
  }

  async clearAuth(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_PROFILE,
        STORAGE_KEYS.MAHAL_ID,
        STORAGE_KEYS.FAMILY_DETAILS,
        STORAGE_KEYS.PIRIVU_STATUS,
      ]);
    } catch (e) {
      console.error('Failed to clear auth storage', e);
    }
  }
}

export const storage = new StorageService();
