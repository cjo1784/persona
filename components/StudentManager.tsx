
import React, { useState } from 'react';
import { Student } from '../types';

interface StudentManagerProps {
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  onAbsenceToggle: (id: string) => void;
  onAddStar: (id: string) => void;
}

const StudentManager: React.FC<StudentManagerProps> = ({ students, setStudents, onAbsenceToggle, onAddStar }) => {
  const [newName, setNewName] = useState('');

  const addStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const newStudent: Student = {
      id: Date.now().toString(),
      number: students.length > 0 ? Math.max(...students.map(s => s.number)) + 1 : 1,
      name: newName.trim(),
      stars: 0
    };
    setStudents([...students, newStudent]);
    setNewName('');
  };

  const deleteStudent = (id: string) => {
    setStudents(students.filter(s => s.id !== id).map((s, idx) => ({ ...s, number: idx + 1 })));
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-slate-800 mb-6">학생 관리 및 칭찬 점수</h2>
      <form onSubmit={addStudent} className="flex gap-3 mb-8">
        <input type="text" placeholder="새 학생 이름" className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500" value={newName} onChange={(e) => setNewName(e.target.value)} />
        <button type="submit" className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-xl">추가</button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {students.sort((a, b) => b.stars - a.stars).map((student) => (
          <div key={student.id} className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${student.isAbsent ? 'bg-slate-50 opacity-60' : 'bg-white shadow-sm hover:shadow-md'}`}>
            <div className="flex items-center gap-3">
              <span className="text-slate-400 font-mono text-xs w-6">{student.number}</span>
              <div>
                <span className="font-bold text-slate-800">{student.name}</span>
                <div className="flex gap-0.5 mt-0.5">
                   {Array.from({ length: Math.min(student.stars, 5) }).map((_, i) => (
                     <span key={i} className="text-yellow-400 text-xs">⭐</span>
                   ))}
                   {student.stars > 5 && <span className="text-xs text-slate-400 font-bold ml-1">+{student.stars - 5}</span>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1 cursor-pointer bg-slate-100 px-2 py-1 rounded-lg text-[10px] font-bold text-slate-500 hover:bg-slate-200">
                <input type="checkbox" checked={student.isAbsent} onChange={() => onAbsenceToggle(student.id)} className="rounded" />
                결석
              </label>
              <button onClick={() => onAddStar(student.id)} className="bg-yellow-100 text-yellow-700 w-8 h-8 rounded-full hover:bg-yellow-200 flex items-center justify-center transition-colors">⭐</button>
              <button onClick={() => deleteStudent(student.id)} className="text-slate-300 hover:text-red-500 p-2">✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentManager;
