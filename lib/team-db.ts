// Couche d'accès Équipe (employees) & Congés (leaves) — Supabase (Phase 2c).
import { supabase } from "./supabase";
import type { AgencySlug, Employee, EmployeeRole, Leave, LeaveType } from "./types";

type EmployeeRow = {
  id: string;
  agency_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  role: string;
  started_at: string;
};

type LeaveRow = {
  id: string;
  employee_id: string;
  agency_id: string;
  type: string;
  starts_at: string;
  ends_at: string;
  reason: string | null;
};

function mapEmployee(r: EmployeeRow): Employee {
  return {
    id: r.id,
    agencyId: r.agency_id as AgencySlug,
    firstName: r.first_name,
    lastName: r.last_name,
    email: r.email,
    role: r.role as EmployeeRole,
    startedAt: r.started_at,
    ...(r.phone ? { phone: r.phone } : {}),
  };
}

function mapLeave(r: LeaveRow): Leave {
  return {
    id: r.id,
    employeeId: r.employee_id,
    agencyId: r.agency_id as AgencySlug,
    type: r.type as LeaveType,
    startsAt: r.starts_at,
    endsAt: r.ends_at,
    ...(r.reason ? { reason: r.reason } : {}),
  };
}

// --- Employees ---

export async function getAllEmployees(): Promise<Employee[]> {
  const { data, error } = await supabase.from("employees").select("*");
  if (error) throw error;
  return (data as EmployeeRow[]).map(mapEmployee);
}

export async function getEmployeesByAgency(
  agencyId: AgencySlug
): Promise<Employee[]> {
  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .eq("agency_id", agencyId);
  if (error) throw error;
  return (data as EmployeeRow[]).map(mapEmployee);
}

export async function getEmployee(id: string): Promise<Employee | null> {
  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapEmployee(data as EmployeeRow) : null;
}

// --- Leaves ---

async function fetchLeaves(): Promise<Leave[]> {
  const { data, error } = await supabase.from("leaves").select("*");
  if (error) throw error;
  return (data as LeaveRow[]).map(mapLeave);
}

export async function getAllLeaves(): Promise<Leave[]> {
  return fetchLeaves();
}

export async function getLeavesByAgency(
  agencyId: AgencySlug
): Promise<Leave[]> {
  const all = await fetchLeaves();
  return all.filter((l) => l.agencyId === agencyId);
}

export async function getCurrentLeavesByAgency(
  agencyId: AgencySlug
): Promise<Leave[]> {
  const now = Date.now();
  const all = await fetchLeaves();
  return all.filter(
    (l) =>
      l.agencyId === agencyId &&
      new Date(l.startsAt).getTime() <= now &&
      new Date(l.endsAt).getTime() >= now
  );
}

export async function getCurrentLeavesNetworkWide(): Promise<Leave[]> {
  const now = Date.now();
  const all = await fetchLeaves();
  return all.filter(
    (l) =>
      new Date(l.startsAt).getTime() <= now &&
      new Date(l.endsAt).getTime() >= now
  );
}

export async function getUpcomingLeavesByAgency(
  agencyId: AgencySlug,
  daysAhead = 14
): Promise<Leave[]> {
  const now = Date.now();
  const horizon = now + daysAhead * 24 * 60 * 60 * 1000;
  const all = await fetchLeaves();
  return all
    .filter((l) => {
      if (l.agencyId !== agencyId) return false;
      const start = new Date(l.startsAt).getTime();
      const end = new Date(l.endsAt).getTime();
      return end >= now && start <= horizon;
    })
    .sort(
      (a, b) =>
        new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
    );
}
