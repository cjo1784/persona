
import { Role } from './types';

export const PASTEL_COLORS = [
  '#DBEAFE', // blue-100
  '#DCFCE7', // green-100
  '#FEF9C3', // yellow-100
  '#FCE7F3', // pink-100
  '#F3E8FF', // purple-100
  '#FFEDD5', // orange-100
  '#E0E7FF', // indigo-100
  '#F1F5F9', // slate-100
  '#CCFBF1', // teal-100
  '#FEF3C7', // amber-100
];

export const DEFAULT_ROLES: Role[] = [
  { id: '1', name: '청소', count: 3, color: PASTEL_COLORS[0] },
  { id: '2', name: '컴퓨터 관리', count: 1, color: PASTEL_COLORS[1] },
  { id: '3', name: '분리수거', count: 1, color: PASTEL_COLORS[2] },
  { id: '4', name: '출석체크', count: 1, color: PASTEL_COLORS[3] },
  { id: '5', name: '화분관리', count: 1, color: PASTEL_COLORS[4] },
];
