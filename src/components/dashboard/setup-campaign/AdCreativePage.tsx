import React, { useState } from 'react';
import { createClient } from '../../../../utils/supabase/client'; // Import Supabase client
import styles from './styles/AdCreativePage.module.css';

interface AdCreativePageProps {
  onNext: () => void;
  onBack: () => void;
  setImageFile: (file: File) => void;
}

const AdCreativePage: React.FC<AdCreativePageProps> = ({ onNext, onBack }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  const uploadImageToSupabase = async (file: File) => {
    const supabase = createClient();
    const filePath = `images/${file.name}`; // Define the path where the image will be stored

    // Upload the image to Supabase Storage
    const { data, error } = await supabase.storage
      .from('adcreatives') // Ensure the bucket name is correct
      .upload(filePath, file);

    if (error) {
      console.error('Error uploading image:', error.message);
      return { error };
    }

    console.log('Image uploaded successfully:', data);

    // Use getPublicUrl() to retrieve the public URL of the uploaded file
    const { data: urlData, error: urlError } = supabase.storage
      .from('adcreatives')
      .getPublicUrl(filePath);

    if (urlError || !urlData) {
      console.error('Error fetching public URL:', urlError?.message);
      return { error: urlError || 'Public URL not available' };
    }

    console.log('Public URL:', urlData.publicUrl);
    return { publicUrl: urlData.publicUrl };
  };

  const handleNext = async () => {
    if (!imageFile) {
      alert('Please upload an image.');
      return;
    }

    const userId = localStorage.getItem('userid');
    if (!userId) {
      console.error('User ID not found');
      return;
    }

    setLoading(true);

    try {
      // Upload the image and get the public URL
      const { publicUrl, error } = await uploadImageToSupabase(imageFile);
      if (error) {
        console.error('Error uploading image or fetching URL:', error);
        alert('Failed to upload the image. Please try again.');
        return;
      }

      // Update the existing row in the Supabase database with the image URL
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from('facebook_campaign_data')
        .update({ image_path: publicUrl }) // Only update the image_path column
        .eq('user_id', userId); // Match the row based on the user_id

      if (updateError) {
        console.error('Error updating image path in Supabase:', updateError.message);
        alert('Failed to save the image. Please try again.');
      } else {
        onNext(); // Proceed to the next step
      }
    } catch (err) {
      console.error('Unexpected error uploading image:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.adCreativeContainer}>
      <h2>Choose your Ad Creative</h2>
      <div className={styles.uploadSection}>
        <input type="file" onChange={handleImageChange} />
        {imageFile && <p>{imageFile.name} selected.</p>}
      </div>
      <div className={styles.buttons}>
        <button className={styles.backButton} onClick={onBack}>
          Go Back
        </button>
        <button className={styles.continueButton} onClick={handleNext} disabled={loading}>
          {loading ? 'Uploading...' : 'Continue'}
        </button>
      </div>
    </div>
  );
};

export default AdCreativePage;
