import { useState } from 'react';
import { ProjectList } from './components/ProjectList';
import { ProjectDetail } from './components/ProjectDetail';

function App() {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
  };

  const handleBackToProjects = () => {
    setSelectedProjectId(null);
  };

  return (
    <>
      {!selectedProjectId ? (
        <ProjectList onSelectProject={handleSelectProject} />
      ) : (
        <ProjectDetail projectId={selectedProjectId} onBack={handleBackToProjects} />
      )}
    </>
  );
}

export default App;
