export interface UserProfile {
  id: string;
  email: string;
  username: string;
  avatarUrl: string;
  coverPhotoUrl?: string;
  bio?: string;
  createdAt: string;
  followingCount?: number;
  followersCount?: number;
}

export interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (emailOrUsername: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (
    email: string,
    username: string,
    password: string,
    termsAccepted: boolean
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
}
