import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
}

// Simulated auth for demo - in production this would hit the API
const DEMO_USER: User = {
  id: 'usr_01',
  email: 'JardenUnido@hireflow.ai',
  name: 'Jem Arden Unido',
  role: 'admin',
  department: 'Talent Acquisition',
  avatar: undefined,
  createdAt: '2024-01-15T08:00:00Z',
};

const DEMO_CANDIDATE: User = {
  id: 'usr_candidate_01',
  email: 'emily.zhang@gmail.com',
  name: 'Emily Zhang',
  role: 'candidate',
  department: undefined,
  avatar: undefined,
  createdAt: '2026-07-20T14:30:00Z',
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, _password: string) => {
        set({ isLoading: true });
        await new Promise((resolve) => setTimeout(resolve, 1200));
        // Route to candidate portal if email matches a candidate
        const isCandidate = email.toLowerCase() !== 'jardenunido@hireflow.ai';
        const user = isCandidate
          ? { ...DEMO_CANDIDATE, email, name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) }
          : DEMO_USER;
        set({ user, isAuthenticated: true, isLoading: false });
      },

      register: async (name: string, email: string, _password: string) => {
        set({ isLoading: true });
        await new Promise((resolve) => setTimeout(resolve, 1500));
        // New registrations are candidates by default
        set({
          user: { ...DEMO_CANDIDATE, name, email },
          isAuthenticated: true,
          isLoading: false,
        });
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      updateProfile: (data) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        }));
      },
    }),
    {
      name: 'hireflow-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
