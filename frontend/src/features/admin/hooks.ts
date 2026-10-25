import { useQuery } from "@tanstack/react-query";
import { adminService } from "./admin.service";

export const useAdminStats = () => {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: adminService.getStats,
  });
};

export const useAdminTransactions = (statusFilter?: string) => {
  return useQuery({
    queryKey: ["admin", "transactions", statusFilter],
    queryFn: () => adminService.getTransactions(statusFilter),
  });
};

export const useAdminSubscriptions = (activeOnly: boolean = false) => {
  return useQuery({
    queryKey: ["admin", "subscriptions", activeOnly],
    queryFn: () => adminService.getSubscriptions(activeOnly),
  });
};

export const useAdminUsers = (search?: string) => {
  return useQuery({
    queryKey: ["admin", "users", search],
    queryFn: () => adminService.getUsers(search),
  });
};