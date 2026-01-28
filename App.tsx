
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Role, Student, Assignment, TabType, HistoryEntry, SequenceInfo, RotationPeriod } from './types';
import { DEFAULT_ROLES } from './constants';
import RoleManager from './components/RoleManager';
import StudentManager from './components/StudentManager';
import AssignmentResults from './components/AssignmentResults';
import HistoryModal from './components/HistoryModal';
import DataManager from './components/DataManager';

const STORAGE_KEY = 'class_roles_app_data_v3';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('roles');
  const [roles, setRoles] = useState<Role[]>(DEFAULT_ROLES);
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [sequence, setSequence] = useState<SequenceInfo>({ 
    current: 1, 
    startDate: new Date().toLocaleDateString(),
    rotationPeriod: '1w'
  });
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [className, setClassName] = useState('우리 반');

  // Load data
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.roles) setRoles(parsed.roles);
        if (parsed.students) setStudents(parsed.students);
        if (parsed.assignments) setAssignments(parsed.assignments);
        if (parsed.history) setHistory(parsed.history);
        if (parsed.sequence) setSequence(parsed.sequence);
        if (parsed.className) setClassName(parsed.className);
      } catch (e) {
        console.error("Failed to parse saved data", e);
      }
    }
  }, []);

  // Save data
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ 
      roles, students, assignments, history, sequence, className 
    }));
  }, [roles, students, assignments, history, sequence, className]);

  // D-Day 계산
  const dDay = useMemo(() => {
    const start = new Date(sequence.startDate);
    const durationMap: Record<RotationPeriod, number> = { '1w': 7, '2w': 14, '1m': 30 };
    const days = durationMap[sequence.rotationPeriod];
    const target = new Date(start);
    target.setDate(start.getDate() + days);
    
    const diff = target.getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }, [sequence]);

  const recordCurrentToHistory = useCallback((currentAssignments: Assignment[], seq: number) => {
    const today = new Date().toLocaleDateString();
    const newEntries: HistoryEntry[] = [];
    currentAssignments.forEach(asgn => {
      const role = roles.find(r => r.id === asgn.roleId);
      asgn.studentIds.forEach(sid => {
        const student = students.find(s => s.id === sid);
        if (role && student) {
          newEntries.push({
            id: `${Date.now()}-${sid}-${asgn.roleId}`,
            date: today,
            sequence: seq,
            studentId: sid,
            studentName: student.name,
            roleId: role.id,
            roleName: role.name
          });
        }
      });
    });
    setHistory(prev => [...prev, ...newEntries]);
  }, [roles, students]);

  const handleAutoAssign = useCallback(() => {
    if (students.length === 0) return alert("학생을 등록해주세요.");
    if (roles.length === 0) return alert("역할을 설정해주세요.");

    const shuffledStudents = [...students].sort(() => Math.random() - 0.5);
    const newAssignments: Assignment[] = roles.map(role => ({ roleId: role.id, studentIds: [] }));

    let ptr = 0;
    const totalSlots = roles.reduce((s, r) => s + r.count, 0);
    for (let i = 0; i < totalSlots; i++) {
      const targetIdx = newAssignments.findIndex(a => a.studentIds.length < (roles.find(r => r.id === a.roleId)?.count || 0));
      if (targetIdx === -1) break;
      const student = shuffledStudents[ptr % shuffledStudents.length];
      newAssignments[targetIdx].studentIds.push(student.id);
      ptr++;
    }

    setAssignments(newAssignments);
    setSequence(prev => ({ ...prev, current: 1, startDate: new Date().toLocaleDateString() }));
    setActiveTab('assignments');
    recordCurrentToHistory(newAssignments, 1);
  }, [roles, students, recordCurrentToHistory]);

  const handleNextSequence = useCallback(() => {
    if (assignments.length === 0) return alert("먼저 자동 배정을 실행해주세요.");
    const flatSlots: string[] = [];
    roles.forEach(r => {
      for(let i=0; i<r.count; i++) flatSlots.push(r.id);
    });
    const nextSeq = sequence.current + 1;
    const newAssignments: Assignment[] = roles.map(role => ({ roleId: role.id, studentIds: [] }));
    const orderedStudents = [...students].sort((a, b) => a.number - b.number);
    const rotationOffset = (nextSeq - 1);
    
    orderedStudents.forEach((student, i) => {
        const roleId = flatSlots[(i + rotationOffset) % flatSlots.length];
        const asgn = newAssignments.find(a => a.roleId === roleId);
        if (asgn) asgn.studentIds.push(student.id);
    });

    setAssignments(newAssignments);
    setSequence(prev => ({ ...prev, current: nextSeq, startDate: new Date().toLocaleDateString() }));
    recordCurrentToHistory(newAssignments, nextSeq);
  }, [roles, students, assignments, sequence, recordCurrentToHistory]);

  const toggleStudentAbsence = (id: string) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, isAbsent: !s.isAbsent } : s));
  };

  const addStar = (id: string) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, stars: (s.stars || 0) + 1 } : s));
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById('assignment-content');
    if (!element) return;
    // @ts-ignore
    window.html2pdf().set({
      margin: 10,
      filename: `${className}_배정표_${sequence.current}회차.pdf`,
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }).from(element).save();
  };

  return (
    <div className="min-h-screen bg-slate-50 print:bg-white pb-12">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 print:hidden">
        <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
               <input 
                type="text" 
                value={className} 
                onChange={e => setClassName(e.target.value)}
                className="text-2xl font-bold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none w-40"
              />
              <span className="text-2xl font-bold text-slate-800">1인 1역</span>
              {dDay <= 3 && (
                <span className={`text-xs px-2 py-1 rounded-full font-bold animate-pulse ${dDay <= 0 ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                   교체 D-{dDay <= 0 ? 'Day' : dDay}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setIsHistoryOpen(true)} className="bg-white border border-slate-200 text-slate-700 font-semibold py-2 px-4 rounded-xl shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2">📜 이력</button>
            <button onClick={handleAutoAssign} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-xl shadow-lg transition-all active:scale-95">🎲 자동 배정</button>
          </div>
        </div>
        
        <nav className="max-w-4xl mx-auto px-4">
          <div className="flex">
            {(['roles', 'students', 'assignments', 'data'] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-4 text-sm font-semibold border-b-2 transition-all ${activeTab === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400'}`}>
                {tab === 'roles' && '🏷️ 설정'}
                {tab === 'students' && '👤 학생'}
                {tab === 'assignments' && '📋 배정'}
                {tab === 'data' && '💾 관리'}
              </button>
            ))}
          </div>
        </nav>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-8 print:mt-0">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px] print:border-none print:shadow-none">
          {activeTab === 'roles' && (
            <div className="p-6">
               <div className="mb-8 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                  <h3 className="text-sm font-bold text-indigo-900 mb-2">📅 로테이션 주기 설정</h3>
                  <div className="flex gap-2">
                    {(['1w', '2w', '1m'] as const).map(p => (
                      <button 
                        key={p} 
                        onClick={() => setSequence(prev => ({ ...prev, rotationPeriod: p }))}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${sequence.rotationPeriod === p ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600 border border-indigo-200'}`}
                      >
                        {p === '1w' ? '1주일' : p === '2w' ? '2주일' : '한 달'}
                      </button>
                    ))}
                  </div>
               </div>
               <RoleManager roles={roles} setRoles={setRoles} />
            </div>
          )}
          {activeTab === 'students' && (
            <StudentManager 
              students={students} 
              setStudents={setStudents} 
              onAbsenceToggle={toggleStudentAbsence}
              onAddStar={addStar}
            />
          )}
          {activeTab === 'assignments' && (
            <div className="p-6 print:p-0" id="assignment-content">
                <div className="flex items-center justify-between mb-6 print:hidden">
                    <h2 className="text-xl font-bold text-slate-800">제 {sequence.current}회차 역할판</h2>
                    <div className="flex gap-2">
                        <button onClick={handleDownloadPDF} className="bg-slate-800 text-white font-bold py-2 px-4 rounded-xl transition-all shadow-md">📥 PDF</button>
                        <button onClick={handleNextSequence} className="bg-emerald-500 text-white font-bold py-2 px-4 rounded-xl shadow-md">🔄 다음 순번</button>
                    </div>
                </div>

                <div className="hidden print:block text-center mb-10">
                    <h1 className="text-3xl font-black mb-2">{className} 역할 배정표</h1>
                    <p className="text-slate-500">회차: {sequence.current} | 일자: {sequence.startDate}</p>
                </div>

                <AssignmentResults 
                    assignments={assignments} 
                    roles={roles} 
                    students={students} 
                    history={history}
                    setAssignments={setAssignments}
                    setRoles={setRoles}
                    onAddStar={addStar}
                />
            </div>
          )}
          {activeTab === 'data' && (
            <DataManager 
              allData={{ roles, students, assignments, history, sequence, className }}
              setRoles={setRoles}
              setStudents={setStudents}
              setAssignments={setAssignments}
              setHistory={setHistory}
              setSequence={setSequence}
              setClassName={setClassName}
            />
          )}
        </div>
      </main>

      <HistoryModal 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
        history={history}
        roles={roles}
        students={students}
      />
    </div>
  );
};

export default App;
