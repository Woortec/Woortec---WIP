import React, { useState } from 'react';
import { Image, X } from '@phosphor-icons/react';
import styles from './styles/PhotoUploadForm.module.css';
import ProgressBar from './ProgressBar';

const PhotoUploadForm: React.FC<{ nextStep: () => void; prevStep: () => void }> = ({ nextStep, prevStep }) => {
  const [image, setImage] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle image upload logic here
    nextStep();
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Campaign Setup: Strategy Name</h2>
      <p className={styles.description}>
        Introducing woorctec - the ultimate social media ads product designed to elevate your online presence and drive results like never before. With woorctec, you can effortlessly create and manage ads across multiple social media platforms, all in one place.
      </p>
      <ProgressBar step={2} />
      <form onSubmit={handleSubmit} className={styles.formContainer}>
        <div className={styles.formContent}>
          <label className={styles.imageUploadLabel}>
            <Image size={32} weight="fill" />
            Drag your image(s) to start uploading
            <input type="file" accept="image/*" onChange={handleChange} className={styles.input} required />
            <span>OR</span>
            <button type="button" className={styles.uploadButton}>
              Upload from your Desktop
            </button>
          </label>
          {image && (
            <div className={styles.imagePreview}>
              <p>{image.name}</p>
              <p>{(image.size / 1024).toFixed(2)} KB</p>
              <button type="button" onClick={() => setImage(null)} className={styles.removeImageButton}>
                <X size={16} />
              </button>
            </div>
          )}
        </div>
        <div className={styles.buttonContainer}>
          <button type="button" onClick={prevStep} className={styles.backButton}>
            Go Back
          </button>
          <button type="submit" className={styles.submitButton}>
            Continue
          </button>
        </div>
      </form>
    </div>
  );
};

export default PhotoUploadForm;
