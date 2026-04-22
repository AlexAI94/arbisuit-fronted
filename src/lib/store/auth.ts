import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from "js-cookie";
import { api } from "@/lib/api";

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  two_fa_enabled: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, totpCode?: string) => Promise<{ requires2fa: boolean }>;
  logout: () => void;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: async (email, password, totpCode) => {
        const { data } = await api.post("/auth/login", {
          email,
          password,
          totp_code: totpCode,
        });

        if (data.requires_2fa) {
          return { requires2fa: true };
        }

        const isSecure = window.location.protocol === "https:";
        Cookies.set("access_token", data.access_token, { secure: isSecure, sameSite: "lax" });
        Cookies.set("refresh_token", data.refresh_token, { secure: isSecure, sameSite: "lax" });

        const meRes = await api.get("/auth/me");
        set({ user: meRes.data, isAuthenticated: true });

        return { requires2fa: false };
      },

      logout: () => {
        Cookies.remove("access_token");
        Cookies.remove("refresh_token");
        set({ user: null, isAuthenticated: false });
      },

      fetchMe: async () => {
        try {
          const { data } = await api.get("/auth/me");
          set({ user: data, isAuthenticated: true });
        } catch {
          set({ user: null, isAuthenticated: false });
        }
      },
    }),
    { name: "orbix-auth", partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated }) }
  )
);
