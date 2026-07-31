// src/lib/api.ts

const API_BASE = "http://localhost:8000/api";

export async function fetchDashboardData(studentId: number = 1) {
  const res = await fetch(`${API_BASE}/dashboard?student_id=${studentId}`);
  if (!res.ok) {
    throw new Error('Failed to fetch dashboard data');
  }
  return res.json();
}

export async function fetchResults(params?: {
  studentId?: number;
  page?: number;
  limit?: number;
  type?: string;
  sort?: string;
  search?: string;
}) {
  const query = new URLSearchParams();
  if (params?.studentId) query.append('student_id', params.studentId.toString());
  if (params?.page) query.append('page', params.page.toString());
  if (params?.limit) query.append('limit', params.limit.toString());
  if (params?.type) query.append('type', params.type);
  if (params?.sort) query.append('sort', params.sort);
  if (params?.search) query.append('search', params.search);

  const res = await fetch(`${API_BASE}/results?${query.toString()}`);
  if (!res.ok) {
    throw new Error('Failed to fetch results');
  }
  return res.json();
}

export async function fetchResultDetails(id: number, studentId: number = 1) {
  const res = await fetch(`${API_BASE}/results/${id}?student_id=${studentId}`);
  if (!res.ok) {
    throw new Error('Failed to fetch result details');
  }
  return res.json();
}
