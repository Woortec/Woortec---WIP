import React, { useState } from 'react';
import { createClient } from '../../../../utils/supabase/client'; // Import Supabase client
import ProgressBar from './ProgressBar'; // Import the progress bar component
import styles from './styles/AdCreativePage.module.css';

interface AdCreativePageProps {
  onNext: () => void;
  onBack: () => void;
  setImageFile: React.Dispatch<React.SetStateAction<File | null>>; // Add setImageFile prop
}

const AdCreativePage: React.FC<AdCreativePageProps> = ({ onNext, onBack, setImageFile }) => {
  const [imageFileLocal, setImageFileLocal] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState(1); // Track current step
  const [uploadProgress, setUploadProgress] = useState<number>(0); // Track upload progress

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFileLocal(file);
      setImageFile(file); // Set the imageFile state in the parent component
    }
  };

  const uploadImageToSupabase = async (file: File) => {
    const supabase = createClient();
    const filePath = `images/${file.name}`;

    // Upload the image to Supabase Storage
    const { data, error } = await supabase.storage
      .from('adcreatives')
      .upload(filePath, file, {
        onUploadProgress: (progress: { loaded: number; total: number }) => {
          setUploadProgress(Math.round((progress.loaded / progress.total) * 100)); // Update progress
        },
      });

    if (error) {
      console.error('Error uploading image:', error.message);
      return { error };
    }

    // Use getPublicUrl() to retrieve the public URL of the uploaded file
    const { data: urlData, error: urlError } = supabase.storage
      .from('adcreatives')
      .getPublicUrl(filePath);

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
    setUploadProgress(0); // Reset progress before upload

    try {
      const { publicUrl, error } = await uploadImageToSupabase(imageFileLocal);

      if (error) {
        alert('Failed to upload the image. Please try again.');
        return;
      }

      // Increment current step to indicate progress
      setCurrentStep(2); // Assuming the next step after uploading is step 2

      // Here you can use the uploaded image URL (publicUrl) as needed, e.g., save to database
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
      {/* Progress Bar Section */}
      <ProgressBar currentStep={currentStep} /> {/* Progress Bar above upload section */}

      <div className={styles.uploadSection}>
        {!imageFileLocal ? (
          <>
            <label htmlFor="file-upload" className={styles.uploadLabel}>
              <img src="/path-to-image/upload-icon.png" alt="Upload" />
              <p>Drag your image(s) to start uploading</p>
              <span>or</span>
              <button className={styles.uploadButton}>Upload from your Desktop</button>
            </label>
            <input id="file-upload" type="file" onChange={handleImageChange} className={styles.fileInput} />
          </>
        ) : (
          <div className={styles.imagePreview}>
            <img src={URL.createObjectURL(imageFileLocal)} alt="Preview" />
            <div className={styles.fileInfo}>
              <p>{imageFileLocal.name}</p>
              <p>{(imageFileLocal.size / 1024).toFixed(0)} KB</p>
            </div>
            <button className={styles.removeButton} onClick={() => setImageFileLocal(null)}>X</button>
          </div>
        )}
      </div>

      {/* Progress Bar Display */}
      {loading && (
        <div className={styles.progressText}>{uploadProgress}%</div>
      )}

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
