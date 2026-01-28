
import React from 'react';

interface DataManagerProps {
  allData: any;
  setRoles: any;
  setStudents: any;
  setAssignments: any;
  setHistory: any;
  setSequence: any;
  setClassName: any;
}

const DataManager: React.FC<DataManagerProps> = ({ 
  allData, setRoles, setStudents, setAssignments, setHistory, setSequence, setClassName 
}) => {
  const downloadBackup = () => {
    const dataStr = JSON.stringify(allData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `class_roles_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (confirm("기존 데이터가 덮어씌워집니다. 계속할까요?")) {
          if (parsed.roles) setRoles(parsed.roles);
          if (parsed.students) setStudents(parsed.students);
          if (parsed.assignments) setAssignments(parsed.assignments);
          if (parsed.history) setHistory(parsed.history);
          if (parsed.sequence) setSequence(parsed.sequence);
          if (parsed.className) setClassName(parsed.className);
          alert("데이터가 성공적으로 복구되었습니다!");
        }
      } catch (err) {
        alert("올바른 백업 파일이 아닙니다.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-10 text-center">
      <div className="max-w-md mx-auto space-y-8">
        <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100">
          <div className="text-4xl mb-4">💾</div>
          <h3 className="text-xl font-bold text-indigo-900 mb-2">데이터 백업</h3>
          <p className="text-sm text-indigo-700 mb-6">현재까지의 모든 설정과 이력을 파일로 저장합니다.</p>
          <button onClick={downloadBackup} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-2xl hover:bg-indigo-700 transition-colors">백업 파일 다운로드</button>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4">백업 데이터 불러오기</h3>
          <label className="block w-full cursor-pointer bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl py-8 hover:bg-slate-100 transition-colors">
            <span className="text-slate-400 font-bold">여기를 클릭하여 파일을 선택하세요</span>
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
        
        <p className="text-xs text-slate-400">데이터는 브라우저에 자동 저장되지만, 브라우저를 초기화하거나 기기를 옮길 경우 백업 기능이 꼭 필요합니다.</p>
      </div>
    </div>
  );
};

export default DataManager;
