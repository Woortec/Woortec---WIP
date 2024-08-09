import React from 'react';
import styles from './styles/PlanOutputUpload.module.css';

interface PlanOutputUploadProps {
  onUpload: (data: any) => void;
}

const PlanOutputUpload: React.FC<PlanOutputUploadProps> = ({ onUpload }) => {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        onUpload(data);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className={styles.container}>
      <input
        type="file"
        accept="application/json"
        onChange={handleFileUpload}
        className={styles.fileInput}
      />
    </div>
  );
};

export default PlanOutputUpload;