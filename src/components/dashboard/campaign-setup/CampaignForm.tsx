import React, { useState } from 'react';
import CampaignNameForm from './CampaignNameForm';
import PhotoUploadForm from './PhotoUploadForm';
import CampaignDetailsForm from './CampaignDetailsForm';

const CampaignSetup: React.FC = () => {
  const [step, setStep] = useState(1);
  const [image, setImage] = useState<File | null>(null); // Store the image as a File object
  const [loading, setLoading] = useState(false); // Loading state for submission
  const [error, setError] = useState<string | null>(null); // Error state for displaying messages

  const nextStep = () => setStep((prevStep) => prevStep + 1);
  const prevStep = () => setStep((prevStep) => prevStep - 1);

  const completeCampaign = async () => {
    setLoading(true);
    setError(null);

    try {
      // Retrieve data from localStorage
      const fbAccessTokenString = localStorage.getItem('fbAccessToken');
      const fbAdAccountString = localStorage.getItem('fbAdAccount');
      const fbPageString = localStorage.getItem('pageId');
      const uploadedCampaignString = localStorage.getItem('uploadedCampaign');
      const uploadedImage = localStorage.getItem('uploadedImage'); // Retrieve the image from localStorage

      // Log raw values to check if they are correctly retrieved
      console.log('Raw fbAccessToken:', fbAccessTokenString);
      console.log('Raw fbAdAccount:', fbAdAccountString);
      console.log('Raw pageId:', fbPageString);
      console.log('Raw uploadedCampaign:', uploadedCampaignString);

      // Parse the data only if it exists
      const accessToken = fbAccessTokenString ? JSON.parse(fbAccessTokenString).value : null;
      const adAccountId = fbAdAccountString ? JSON.parse(fbAdAccountString).value : null;
      const pageId = fbPageString ? JSON.parse(fbPageString).value : null;
      const uploadedCampaign = uploadedCampaignString ? JSON.parse(uploadedCampaignString) : null;

      // Log the parsed values to ensure they're correct
      console.log('Parsed accessToken:', accessToken);
      console.log('Parsed adAccountId:', adAccountId);
      console.log('Parsed pageId:', pageId);
      console.log('Parsed uploadedCampaign:', uploadedCampaign);

      // Check if all required data is present
      if (!accessToken || !adAccountId || !pageId || !uploadedCampaign) {
        console.error('Missing required campaign data:', {
          accessToken,
          adAccountId,
          pageId,
          uploadedCampaign,
        });
        alert('Failed to retrieve campaign data. Please check if all fields are filled.');
        return;
      }

      // Prepare the form data to send to the backend
      const formData = new FormData();
      formData.append('accessToken', accessToken);
      formData.append('adAccountId', adAccountId);
      formData.append('pageId', pageId);
      formData.append('uploadedCampaign', JSON.stringify(uploadedCampaign));

      // If there's an image saved, convert the data URL back to a file and append it
      if (uploadedImage) {
        const blob = dataURLtoBlob(uploadedImage);
        formData.append('image', blob, 'uploadedImage.png');
      }

      console.log('Form Data:', formData); // Log to ensure the data is correct

      // Send the campaign data to the server
      const response = await fetch('/api/create-campaign1', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload campaign');
      }

      const result = await response.json();
      console.log('Campaign uploaded successfully:', result);
      alert('Campaign created successfully!');
      setStep(1); // Reset to the first step or navigate to another page as needed
    } catch (error) {
      console.error('Error uploading campaign:', error);
      setError('Error uploading campaign. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to convert a data URL to a Blob
// Helper function to convert a data URL to a Blob
function dataURLtoBlob(dataurl: string): Blob {
  const arr = dataurl.split(','), 
        mime = arr[0].match(/:(.*?);/)![1], 
        bstr = atob(arr[1]), 
        n = bstr.length, 
        u8arr = new Uint8Array(n);
        
  let i = n;
  while (i--) {
    u8arr[i] = bstr.charCodeAt(i);
  }

  return new Blob([u8arr], { type: mime });
}


  return (
    <div>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      {step === 1 && <CampaignDetailsForm nextStep={nextStep} />}
      {step === 2 && (
        <PhotoUploadForm nextStep={nextStep} prevStep={prevStep} setImage={setImage} />
      )}
      {step === 3 && (
        <CampaignNameForm prevStep={prevStep} complete={completeCampaign} />
      )}
      {loading && <div>Loading...</div>} {/* Simple loading indicator */}
    </div>
  );
};

export default CampaignSetup;
