export interface Organization {
  id: string;
  name: string;
  invite_code: string;
  role: "owner" | "manager" | "member";
  member_count: number;
  created_at: string;
}

export interface MemberProgress {
  user_id: string;
  name: string | null;
  /** فقط برای مالک/مدیر پر است؛ برای اعضای ساده null است */
  email: string | null;
  role: "owner" | "manager" | "member";
  joined_at: string;
  practice_count: number;
  average_score: number | null;
  best_score: number | null;
  last_active_at: string | null;
}
