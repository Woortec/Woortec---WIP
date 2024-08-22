import React, { useState } from 'react';
import { Image, X } from '@phosphor-icons/react';
import styles from './styles/PhotoUploadForm.module.css';
import ProgressBar from './ProgressBar';

const PhotoUploadForm: React.FC<{ nextStep: () => void; prevStep: () => void; setImage: (file: File | null) => void }> = ({ nextStep, prevStep, setImage }) => {
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null); // Reset error message on new upload attempt
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Validate file type
      if (!selectedFile.type.startsWith('image/')) {
        setError('Please upload a valid image file.');
        return;
      }
      
      setFile(selectedFile); // Store the file locally
      setImage(selectedFile); // Pass the image file to the main component
      setImagePreviewUrl(URL.createObjectURL(selectedFile)); // Set preview URL

      // Optionally, save the image to localStorage or another persistent storage
      const reader = new FileReader();
      reader.onload = () => {
        localStorage.setItem('uploadedImage', reader.result as string); // Save the image as a data URL
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (file) {
      nextStep(); // Proceed to the next step if an image is selected
    } else {
      setError('Please upload an image.');
    }
  };

  const removeImage = () => {
    setFile(null);
    setImagePreviewUrl(null);
    setImage(null);
    localStorage.removeItem('uploadedImage'); // Remove the image from localStorage
  };

  const triggerFileInputClick = () => {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
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
            <button type="button" className={styles.uploadButton} onClick={triggerFileInputClick}>
              Upload from your Desktop
            </button>
          </label>
          {error && <p className={styles.error}>{error}</p>}
          {imagePreviewUrl && (
            <div className={styles.imagePreview}>
              <img src={imagePreviewUrl} alt="Preview" className={styles.previewImage} />
              <div className={styles.imageDetails}>
                <button type="button" onClick={removeImage} className={styles.removeImageButton}>
                  <X size={16} />
                </button>
              </div>
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
