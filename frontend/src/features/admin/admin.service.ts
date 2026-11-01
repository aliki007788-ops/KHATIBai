import { apiClient } from "@/lib/api/client";

export interface AdminStats {
  total_users: number;
  active_subscriptions: number;
  total_revenue_toman: number;
  today_practices: number;
}

export interface AdminTransaction {
  id: string;
  user_id: string;
  plan: string;
  amount_toman: number;
  status: string;
  provider: string;
  authority: string | null;
  ref_id: string | null;
  created_at: string;
}

export interface AdminSubscription {
  id: string;
  user_id: string;
  plan: string;
  status: string;
  starts_at: string;
  expires_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  plan: string;
  active: boolean;
  email_verified: boolean;
  created_at: string;
}

export const adminService = {
  getStats: async () => {
    const res = await apiClient.get<AdminStats>("/api/admin/stats");
    return res.data;
  },
  
  getTransactions: async (statusFilter?: string) => {
    const url = statusFilter 
      ? `/api/admin/transactions?status_filter=${statusFilter}` 
      : "/api/admin/transactions";
    const res = await apiClient.get<AdminTransaction[]>(url);
    return res.data;
  },
  
  getSubscriptions: async (activeOnly: boolean = false) => {
    const res = await apiClient.get<AdminSubscription[]>(`/api/admin/subscriptions?active_only=${activeOnly}`);
    return res.data;
  },
  
  getUsers: async (search?: string) => {
    const url = search 
      ? `/api/admin/users?search=${encodeURIComponent(search)}` 
      : "/api/admin/users";
    const res = await apiClient.get<AdminUser[]>(url);
    return res.data;
  },
};