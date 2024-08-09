import React from 'react';
import styles from './styles/ImageUpload.module.css';

interface ImageUploadProps {
  onUpload: (image: File) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onUpload }) => {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div className={styles.container}>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className={styles.fileInput}
      />
    </div>
  );
};

export default ImageUpload;