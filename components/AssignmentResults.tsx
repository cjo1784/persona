
import React, { useState } from 'react';
import { Assignment, Role, Student, HistoryEntry } from '../types';

interface AssignmentResultsProps {
  assignments: Assignment[];
  roles: Role[];
  students: Student[];
  history: HistoryEntry[];
  setAssignments: React.Dispatch<React.SetStateAction<Assignment[]>>;
  setRoles: React.Dispatch<React.SetStateAction<Role[]>>;
  onAddStar: (id: string) => void;
}

const AssignmentResults: React.FC<AssignmentResultsProps> = ({ assignments, roles, students, history, setAssignments, setRoles, onAddStar }) => {
  const [replacing, setReplacing] = useState<{ roleId: string, originalStudentId: string } | null>(null);

  const toggleComplete = (roleId: string) => {
    setRoles(prev => prev.map(r => r.id === roleId ? { ...r, isCompleted: !r.isCompleted } : r));
  };

  const assignTemp = (targetStudentId: string) => {
    if (!replacing) return;
    setAssignments(prev => prev.map(asgn => {
      if (asgn.roleId === replacing.roleId) {
        const temps = { ...(asgn.tempAssignments || {}) };
        temps[replacing.originalStudentId] = targetStudentId;
        return { ...asgn, tempAssignments: temps };
      }
      return asgn;
    }));
    setReplacing(null);
  };

  const removeTemp = (roleId: string, originalId: string) => {
    setAssignments(prev => prev.map(asgn => {
      if (asgn.roleId === roleId) {
        const temps = { ...(asgn.tempAssignments || {}) };
        delete temps[originalId];
        return { ...asgn, tempAssignments: temps };
      }
      return asgn;
    }));
  };

  if (assignments.length === 0) return <div className="p-20 text-center text-slate-400">배정 데이터가 없습니다.</div>;

  return (
    <div className="relative">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 print:grid-cols-2">
        {assignments.map((assignment) => {
          const role = roles.find(r => r.id === assignment.roleId);
          if (!role) return null;

          return (
            <div key={role.id} className={`rounded-3xl border-2 p-6 transition-all flex flex-col ${role.isCompleted ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-100'}`} style={!role.isCompleted ? { backgroundColor: role.color + '30' } : {}}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                   <input type="checkbox" checked={role.isCompleted} onChange={() => toggleComplete(role.id)} className="w-5 h-5 rounded-full border-2 border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" />
                   <h3 className={`font-black text-xl ${role.isCompleted ? 'text-indigo-900' : 'text-slate-800'}`}>{role.name}</h3>
                </div>
                {role.isCompleted && <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">Done</span>}
              </div>
              
              <div className="space-y-3">
                {assignment.studentIds.map((sid) => {
                  const student = students.find(s => s.id === sid);
                  const tempId = assignment.tempAssignments?.[sid];
                  const tempStudent = students.find(s => s.id === tempId);
                  const isAbsent = student?.isAbsent;

                  return (
                    <div key={sid} className={`flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-100 shadow-sm ${isAbsent ? 'border-dashed border-red-200' : ''}`}>
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col">
                          <span className={`font-bold text-sm ${isAbsent ? 'text-slate-300 line-through' : 'text-slate-700'}`}>
                            {student?.name} {isAbsent && '(결석)'}
                          </span>
                          {tempStudent && (
                            <span className="text-xs font-black text-red-500 bg-red-50 px-1.5 rounded-md mt-1 animate-bounce inline-block">
                              ➡️ {tempStudent.name} (대행)
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 print:hidden">
                        {isAbsent && !tempStudent && (
                          <button onClick={() => setReplacing({ roleId: role.id, originalStudentId: sid })} className="text-[10px] bg-red-50 text-red-600 px-2 py-1 rounded-md font-bold hover:bg-red-100">대행 지정</button>
                        )}
                        {tempStudent && (
                          <button onClick={() => removeTemp(role.id, sid)} className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded-md font-bold">복구</button>
                        )}
                        <button onClick={() => onAddStar(tempStudent?.id || sid)} className="text-sm hover:scale-125 transition-transform">⭐</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {replacing && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-lg font-black mb-4 text-slate-800">임시 배정 (결석자 대신)</h3>
            <p className="text-sm text-slate-500 mb-4">현재 출석 중인 학생 중 한 명을 선택하세요.</p>
            <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto p-2">
               {students.filter(s => !s.isAbsent).map(s => (
                 <button key={s.id} onClick={() => assignTemp(s.id)} className="p-2 border border-slate-200 rounded-xl text-sm font-bold hover:bg-indigo-50 hover:border-indigo-300">{s.name}</button>
               ))}
            </div>
            <button onClick={() => setReplacing(null)} className="w-full mt-6 py-3 bg-slate-100 text-slate-500 font-bold rounded-xl">취소</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentResults;
