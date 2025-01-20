import React, { useState } from 'react';
import { createClient } from '../../../../utils/supabase/client';
import ProgressBar from './ProgressBar';
import styles from './styles/AdCreativePage.module.css';

interface AdCreativePageProps {
  onNext: () => void;
  onBack: () => void;
  setImageFile: React.Dispatch<React.SetStateAction<File | null>>;
}

const AdCreativePage: React.FC<AdCreativePageProps> = ({ onNext, onBack, setImageFile }) => {
  const [imageFileLocal, setImageFileLocal] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFileLocal(file);
      setImageFile(file);
    }
  };

  const uploadImageToSupabase = async (file: File) => {
    const supabase = createClient();
    const filePath = `images/${file.name}`;

    // Upload the image to Supabase Storage
    const { data, error } = await supabase.storage.from('adcreatives').upload(filePath, file);

    if (error) {
      console.error('Error uploading image:', error.message);
      return { error };
    }

    const { data: urlData, error: urlError } = supabase.storage.from('adcreatives').getPublicUrl(filePath);

    if (urlError || !urlData) {
      console.error('Error fetching public URL:', urlError?.message);
      return { error: urlError || 'Public URL not available' };
    }

    return { publicUrl: urlData.publicUrl };
  };

  const handleNext = async () => {
    if (!imageFileLocal) {
      alert('Please upload an image.');
      return;
    }

    setLoading(true);
    setUploadProgress(0); // Progress is not currently tracked by upload()

    try {
      const { publicUrl, error } = await uploadImageToSupabase(imageFileLocal);

      if (error) {
        alert('Failed to upload the image. Please try again.');
        return;
      }

      // Move to next step
      setCurrentStep(2);
      console.log('Image uploaded successfully with URL:', publicUrl);
      onNext();
    } catch (err) {
      console.error('Unexpected error uploading image:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.adCreativeContainer}>
      <ProgressBar currentStep={currentStep} />

      <div className={styles.uploadSection}>
        {!imageFileLocal ? (
          <>
            <label htmlFor="file-upload" className={styles.uploadLabel}>
              <img src="/path-to-image/upload-icon.png" alt="Upload" />
              <p>Drag your image(s) to start uploading</p>
              <span>or</span>
              <button className={styles.uploadButton}>Upload from your Desktop</button>
            </label>
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className={styles.fileInput}
            />
          </>
        ) : (
          <div className={styles.imagePreview}>
            <img src={URL.createObjectURL(imageFileLocal)} alt="Preview" />
            <div className={styles.fileInfo}>
              <p>{imageFileLocal.name}</p>
              <p>{(imageFileLocal.size / 1024).toFixed(0)} KB</p>
            </div>
            <button className={styles.removeButton} onClick={() => setImageFileLocal(null)}>
              X
            </button>
          </div>
        )}
      </div>

      {loading && <div className={styles.progressText}>{uploadProgress}%</div>}

      <div className={styles.buttons}>
        <button className={styles.backButton} onClick={onBack}>Go Back</button>
        <button className={styles.continueButton} onClick={handleNext} disabled={loading}>
          {loading ? 'Uploading...' : 'Continue'}
        </button>
      </div>
    </div>
  );
};

export default AdCreativePage;
