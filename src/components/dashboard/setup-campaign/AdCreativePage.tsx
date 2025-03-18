import React, { useState, useRef } from 'react';
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
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [showPopup, setShowPopup] = useState<boolean>(false); // Popup state

  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for file input

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFileLocal(file);
      setImageFile(file);
    }
  };

  const uploadImageToSupabase = async (file: File) => {
    setShowPopup(true);
    const supabase = createClient();
    const userId = localStorage.getItem('userid');
  
    if (!userId) {
      console.error('User ID not found in localStorage');
      alert('User ID is required to upload images.');
      setShowPopup(false);
      return { error: 'User ID not found' };
    }
  
    // **Generate a short, unique filename**
    const fileExtension = file.name.split('.').pop(); // Get file extension (jpg, png, etc.)
    const today = new Date();
    const datePart = today.toISOString().slice(2, 10).replace(/-/g, ''); // YYMMDD format
    const randomPart = Math.floor(Math.random() * 9000) + 1000; // 4-digit random number
    const newFileName = `${userId}_${datePart}_${randomPart}.${fileExtension}`;
    const filePath = `images/${userId}/${newFileName}`;
  
    // **Upload the image with the new filename**
    const { data, error } = await supabase.storage.from('adcreatives').upload(filePath, file);
  
    if (error) {
      console.error('Error uploading image:', error.message);
      setShowPopup(false);
      return { error };
    }
  
    // **Get the public URL**
    const { data: urlData } = supabase.storage.from('adcreatives').getPublicUrl(filePath);
  
    if (!urlData) {
      console.error('Error fetching public URL');
      setShowPopup(false);
      return { error: 'Public URL not available' };
    }
  
    const imageUrl = urlData.publicUrl;
  
    // **Update database**
    const { error: updateError } = await supabase
      .from('facebook_campaign_data')
      .update({ image_path: imageUrl })
      .eq('user_id', userId);
  
    if (updateError) {
      console.error('Error updating database:', updateError.message);
      setShowPopup(false);
      return { error: updateError };
    }
  
    console.log('Image uploaded and URL saved successfully:', imageUrl);
    setShowPopup(false);
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
      onNext();
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
            <button 
              className={styles.uploadButton} 
              onClick={() => fileInputRef.current?.click()}
            >
              Upload from your Desktop
            </button>
          </label>
          <input
            ref={fileInputRef} // Reference for triggering file input
            id="file-upload"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className={styles.fileInput}
          />
        </div>

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

      <div className={styles.buttons}>
        <button className={styles.backButton} onClick={onBack}>Go Back</button>
        <button className={styles.continueButton} onClick={handleNext} disabled={loading}>
          {loading ? 'Uploading...' : 'Continue'}
        </button>
      </div>

      {/* Popup Modal */}
      {showPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popup}>
            <p>Uploading Image... Please wait</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdCreativePage;
