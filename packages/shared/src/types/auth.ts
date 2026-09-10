export interface User {
  id: string;
  phone: string;
  name: string | null;
  is_verified: boolean;
  last_login_at: Date | null;
  is_active: boolean;
  created_at: Date;
}

export interface UserMahalRole {
  id: string;
  user_id: string;
  mahal_id: string;
  member_id: string | null;
  role: string;
  granted_by_user_id: string | null;
  granted_at: Date;
  is_active: boolean;
}

export interface JwtPayload {
  sub: string;        // user_id
  phone: string;
  mahal_id: string;   // resolved from user's active role
  roles: string[];    // all active roles in this mahal
  iat?: number;
  exp?: number;
}