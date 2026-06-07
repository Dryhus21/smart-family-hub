export type FamilyRole = "admin" | "member";
export type TaskStatus = "belum_dimulai" | "sedang_dikerjakan" | "selesai";

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  belum_dimulai: "Belum Dimulai",
  sedang_dikerjakan: "Sedang Dikerjakan",
  selesai: "Selesai",
};

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  created_at: string;
};

export type Family = {
  id: string;
  family_name: string;
  description: string | null;
  photo_url: string | null;
  created_by: string;
  created_at: string;
};

export type FamilyMember = {
  id: string;
  family_id: string;
  user_id: string;
  role: FamilyRole;
  joined_at: string;
};

export type FamilyMemberWithProfile = FamilyMember & { profile: Profile };

export type Event = {
  id: string;
  family_id: string;
  title: string;
  event_date: string;
  event_time: string | null;
  location: string | null;
  description: string | null;
  created_by: string;
  created_at: string;
};

export type Task = {
  id: string;
  family_id: string;
  task_name: string;
  description: string | null;
  assigned_to: string | null;
  status: TaskStatus;
  deadline: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type Note = {
  id: string;
  family_id: string;
  title: string;
  content: string;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type ActivityLog = {
  id: string;
  family_id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

export type Invitation = {
  id: string;
  family_id: string;
  email: string;
  invited_by: string;
  token: string;
  status: "pending" | "accepted" | "revoked";
  created_at: string;
};
