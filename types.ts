
export interface Role {
  id: string;
  name: string;
  count: number;
  color: string;
  isCompleted?: boolean; // 오늘 임무 완수 여부 (UI용)
}

export interface Student {
  id: string;
  number: number;
  name: string;
  isAbsent?: boolean;    // 결석 여부
  stars: number;         // 칭찬 별표 개수
}

export interface Assignment {
  roleId: string;
  studentIds: string[];
  tempAssignments?: Record<string, string>; // { 원주인ID: 임시ID }
}

export interface HistoryEntry {
  id: string;
  date: string;
  sequence: number;
  studentId: string;
  studentName: string;
  roleId: string;
  roleName: string;
}

export type RotationPeriod = '1w' | '2w' | '1m';

export interface SequenceInfo {
  current: number;
  startDate: string;
  rotationPeriod: RotationPeriod;
}

export type TabType = 'roles' | 'students' | 'assignments' | 'data';
