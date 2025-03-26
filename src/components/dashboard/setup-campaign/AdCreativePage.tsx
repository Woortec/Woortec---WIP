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
    const userId = localStorage.getItem('userid'); // Get the user ID
  
    if (!userId) {
      console.error('User ID not found in localStorage');
      alert('User ID is required to upload images.');
      return { error: 'User ID not found' };
    }
  
    const filePath = `images/${userId}/${file.name}`; // Store images per user
  
    // Upload the image to Supabase Storage
    const { data, error } = await supabase.storage.from('adcreatives').upload(filePath, file);
  
    if (error) {
      console.error('Error uploading image:', error.message);
      return { error };
    }
  
    // Get the public URL of the uploaded image
    const { data: urlData } = supabase.storage.from('adcreatives').getPublicUrl(filePath);
  
    if (!urlData) {
      console.error('Error fetching public URL');
      return { error: 'Public URL not available' };
    }
  
    const imageUrl = urlData.publicUrl;
  
    // ✅ Store image URL in the correct row in `facebook_campaign_data`
    const { error: updateError } = await supabase
      .from('facebook_campaign_data')
      .update({ image_path: imageUrl }) // Update the image_path field
      .eq('user_id', userId); // Match the correct user
  
    if (updateError) {
      console.error('Error updating database with image URL:', updateError.message);
      return { error: updateError };
    }
  
    console.log('Image uploaded and URL saved successfully:', imageUrl);
    return { publicUrl: imageUrl };
  };
  
  const handleNext = async () => {
    if (!imageFileLocal) {
      alert('Please upload an image.');
      return;
    }
  
    setLoading(true);
    try {
      const { publicUrl, error } = await uploadImageToSupabase(imageFileLocal);
  
      if (error) {
        alert('Failed to upload the image. Please try again.');
        return;
      }
  
      console.log('Image uploaded successfully with URL:', publicUrl);
      onNext(); // Move to the next step
    } catch (err) {
      console.error('Unexpected error uploading image:', err);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className={styles.adCreativeContainer}>
        <div className={styles.descriptionContainer}>
          <h2 className={styles.heading}>Campaign Setup: Choose your Ad Creatives</h2>
          <p className={styles.paragraph}>
            Seamlessly integrate your visual assets with Facebook’s Marketing API using Woortec. 
            Simply upload your images, configure your ad creative settings, and Woortec handles the rest. 
            Enjoy a streamlined process that ensures your ads are live and optimized for maximum impact.
          </p>
        </div>
      <div className={styles.divider}>
      <h2 className={styles.headingUpload}>Upload your images</h2>
      </div>

      <div className={styles.uploadContainer}>
        <div className={styles.uploadSection}>
          <label htmlFor="file-upload" className={styles.uploadLabel}>
            <div className={styles.divimg}><img className={styles.imgLabel} src="/images/photo.svg" alt="Upload" /></div>
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
        </div>

        {/* Image preview is only displayed when there's an image uploaded */}
        {imageFileLocal && (
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


      {/* {loading && <div className={styles.progressText}>{uploadProgress}%</div>} */}

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
