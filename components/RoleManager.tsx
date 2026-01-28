
import React, { useState } from 'react';
import { Role } from '../types';
import { PASTEL_COLORS } from '../constants';

interface RoleManagerProps {
  roles: Role[];
  setRoles: React.Dispatch<React.SetStateAction<Role[]>>;
}

const RoleManager: React.FC<RoleManagerProps> = ({ roles, setRoles }) => {
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleCount, setNewRoleCount] = useState(1);

  const addRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    const newRole: Role = {
      id: Date.now().toString(),
      name: newRoleName,
      count: newRoleCount,
      color: PASTEL_COLORS[roles.length % PASTEL_COLORS.length]
    };

    setRoles([...roles, newRole]);
    setNewRoleName('');
    setNewRoleCount(1);
  };

  const deleteRole = (id: string) => {
    setRoles(roles.filter(r => r.id !== id));
  };

  const updateCount = (id: string, count: number) => {
    if (count < 1) return;
    setRoles(roles.map(r => r.id === id ? { ...r, count } : r));
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-800">역할 목록 설정</h2>
        <span className="text-sm text-slate-500 bg-slate-100 py-1 px-3 rounded-full">
          총 {roles.length}개 역할 / {roles.reduce((acc, r) => acc + r.count, 0)}명 필요
        </span>
      </div>

      <form onSubmit={addRole} className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8 bg-slate-50 p-4 rounded-xl border border-dashed border-slate-300">
        <div className="md:col-span-1">
          <input
            type="text"
            placeholder="역할 이름 (예: 급식 당번)"
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1"
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={newRoleCount}
            onChange={(e) => setNewRoleCount(parseInt(e.target.value) || 1)}
          />
          <span className="whitespace-nowrap text-slate-600">명</span>
        </div>
        <button
          type="submit"
          className="bg-slate-800 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors"
        >
          역할 추가
        </button>
      </form>

      <div className="space-y-3">
        {roles.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            등록된 역할이 없습니다. 위의 양식을 통해 추가해보세요!
          </div>
        ) : (
          roles.map((role) => (
            <div 
              key={role.id} 
              className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:shadow-md transition-shadow"
              style={{ backgroundColor: role.color + '20' }} // Low opacity background
            >
              <div className="flex items-center gap-4">
                <div 
                  className="w-3 h-10 rounded-full"
                  style={{ backgroundColor: role.color }}
                ></div>
                <div>
                  <h3 className="font-bold text-slate-800">{role.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <button 
                      onClick={() => updateCount(role.id, role.count - 1)}
                      className="w-6 h-6 flex items-center justify-center bg-white border border-slate-200 rounded-md text-xs hover:bg-slate-50"
                    >-</button>
                    <span className="text-sm font-medium text-slate-600">{role.count}명</span>
                    <button 
                      onClick={() => updateCount(role.id, role.count + 1)}
                      className="w-6 h-6 flex items-center justify-center bg-white border border-slate-200 rounded-md text-xs hover:bg-slate-50"
                    >+</button>
                  </div>
                </div>
              </div>
              <button
                onClick={() => deleteRole(role.id)}
                className="text-slate-400 hover:text-red-500 p-2 transition-colors"
                title="삭제"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RoleManager;
