import React, { useState } from 'react';
import { createClient } from '../../../../utils/supabase/client';
import styles from './styles/AdCreativePage.module.css';

interface AdCreativePageProps {
  onNext: (uploadedImageUrl: string) => void;
  onBack: () => void;
}


const AdCreativePage: React.FC<AdCreativePageProps> = ({ onNext, onBack }) => {
  const [imageFileLocal, setImageFileLocal] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showPopup, setShowPopup] = useState<boolean>(false);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFileLocal(file);
    }
  };

  const uploadImageToSupabase = async (file: File) => {
    setShowPopup(true);
    const supabase = createClient();
    const userId = localStorage.getItem("userid");
  
    if (!userId) {
      alert("User ID is required to upload images.");
      setShowPopup(false);
      return { error: "User ID not found" };
    }
  
    // ✅ Generate a unique filename using week number + timestamp
    const generateUniqueFilename = (originalName: string) => {
      const now = new Date();
      const year = now.getFullYear();
      const oneJan = new Date(year, 0, 1);
      const dayOfYear = ((now.getTime() - oneJan.getTime()) / 86400000) + 1;
      const weekNumber = Math.ceil(dayOfYear / 7);
      const yearLastTwoDigits = year.toString().slice(-2);
      const timestamp = now.getTime();
      const extension = originalName.split(".").pop();
      return `W${weekNumber}${yearLastTwoDigits}_${timestamp}.${extension}`;
    };
  
    const uniqueFilename = generateUniqueFilename(file.name);
    const filePath = `images/${userId}/${uniqueFilename}`;
  
    const { error } = await supabase.storage.from("adcreatives").upload(filePath, file);
  
    if (error) {
      console.error("❌ Error uploading image:", error.message);
      setShowPopup(false);
      return { error };
    }
  
    // ✅ Get public URL
    const { data } = supabase.storage.from("adcreatives").getPublicUrl(filePath);
    if (!data) {
      console.error("❌ Error fetching public URL");
      setShowPopup(false);
      return { error: "Public URL not available" };
    }
  
    const imageUrl = data.publicUrl;
    console.log("✅ Image uploaded successfully:", imageUrl);
  
    // ✅ Store the image URL in the database
    const { error: dbError } = await supabase
      .from("facebook_campaign_data")
      .update({ image_path: imageUrl })
      .eq("user_id", userId);
  
    if (dbError) {
      console.error("❌ Error saving image URL to database:", dbError.message);
      setShowPopup(false);
      return { error: dbError.message };
    }
  
    console.log("✅ Image URL saved to database:", imageUrl);
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
      const result = await uploadImageToSupabase(imageFileLocal);
  
      if (result?.error) {
        alert('Failed to upload the image. Please try again.');
        return;
      }
  
      const uploadedImageUrl = result?.publicUrl; // Ensure you get the public URL here
      if (uploadedImageUrl) {
        onNext(uploadedImageUrl); // Pass the URL to onNext
      }
    } catch (err) {
      console.error('❌ Unexpected error uploading image:', err);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className={styles.adCreativeContainer}>
      {showPopup && (
        <div className={styles.popup}>
          <p>Uploading image...</p>
        </div>
      )}

      <div className={styles.descriptionContainer}>
        <h2 className={styles.heading}>Campaign Setup: Choose your Ad Creatives</h2>
        <p className={styles.paragraph}>
          Seamlessly integrate your visual assets with Facebook’s Marketing API using Woortec.
        </p>
      </div>
      <div className={styles.divider}>
      <h2 className={styles.headingUpload}>Upload your images</h2>
      </div>

      <div className={styles.uploadContainer}>
        <div className={styles.uploadSection}>
          <label htmlFor="file-upload" className={styles.uploadLabel}>
            <div className={styles.divimg}>
              <img className={styles.imgLabel} src="/images/photo.svg" alt="Upload" />
            </div>
            <p>Drag your image(s) to start uploading</p>
            <span>or</span>
            <button className={styles.uploadButton} onClick={() => document.getElementById('file-upload')?.click()}>
              Upload from your Device
            </button>
          </label>
          <input
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
            <button className={styles.removeButton} onClick={() => setImageFileLocal(null)}>X</button>
          </div>
        )}
      </div>

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
