
import React, { useState, useMemo } from 'react';
import { HistoryEntry, Role, Student } from '../types';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryEntry[];
  roles: Role[];
  students: Student[];
}

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, history, roles, students }) => {
  const [filterStudent, setFilterStudent] = useState('');
  const [filterRole, setFilterRole] = useState('');

  const filteredHistory = useMemo(() => {
    return history.filter(h => {
      const matchStudent = filterStudent === '' || h.studentId === filterStudent;
      const matchRole = filterRole === '' || h.roleId === filterRole;
      return matchStudent && matchRole;
    }).reverse();
  }, [history, filterStudent, filterRole]);

  const exportCSV = () => {
    const header = "날짜,회차,학생이름,역할이름\n";
    const rows = filteredHistory.map(h => `${h.date},${h.sequence},${h.studentName},${h.roleName}`).join("\n");
    const blob = new Blob(["\uFEFF" + header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `역할이력_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">누적 활동 이력</h2>
            <p className="text-xs text-slate-500">지금까지 학생들이 수행한 모든 기록입니다.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={exportCSV} className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-bold hover:bg-emerald-200">CSV 내보내기</button>
            <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors">✕</button>
          </div>
        </div>

        <div className="p-4 bg-white border-b border-slate-50 flex flex-wrap gap-2">
          <select value={filterStudent} onChange={e => setFilterStudent(e.target.value)} className="flex-1 min-w-[120px] px-3 py-2 rounded-lg border border-slate-200 text-sm">
            <option value="">모든 학생</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={filterRole} onChange={e => setFilterRole(e.target.value)} className="flex-1 min-w-[120px] px-3 py-2 rounded-lg border border-slate-200 text-sm">
            <option value="">모든 역할</option>
            {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto p-0">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-50 text-slate-500 text-[10px] uppercase font-bold border-b border-slate-100">
              <tr>
                <th className="py-3 px-6">정보</th>
                <th className="py-3 px-6">학생</th>
                <th className="py-3 px-6">역할</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredHistory.length === 0 ? (
                <tr><td colSpan={3} className="py-10 text-center text-slate-400 text-sm">기록이 없습니다.</td></tr>
              ) : (
                filteredHistory.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6 text-sm">
                      <div className="font-semibold text-slate-700">{h.date}</div>
                      <div className="text-[10px] text-slate-400">{h.sequence}회차</div>
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-800">{h.studentName}</td>
                    <td className="py-4 px-6 text-xs text-slate-500">{h.roleName}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-right">
          <button onClick={onClose} className="bg-slate-800 text-white px-6 py-2 rounded-xl font-bold">닫기</button>
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;
