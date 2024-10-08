import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './styles/ObjectivePage.module.css';
import StepIndicator from './StepIndicator';
import { createClient } from '../../../../utils/supabase/client'; // Import Supabase client

const ObjectivePage: React.FC = () => {
    const navigate = useNavigate();

    // State to store the form data
    const [formData, setFormData] = useState({
        objective: '',
        budget: '',
        manageInquiries: '',
        trafficUrl: ''
    });

    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    // Function to store form data in Supabase
    const storeDataInSupabase = async () => {
        try {
            const supabase = createClient();

            // Retrieve user_id from localStorage
            const user_id = localStorage.getItem('userid'); // Assuming user_id is stored in localStorage

            if (!user_id) {
                console.error('User ID not found in localStorage');
                return;
            }

            const { data, error } = await supabase
                .from('ads_strategy')  // Use your actual table name
                .insert([
                    {
                        user_id: user_id,  // Link user_id
                        objective: formData.objective,
                        budget: formData.budget,
                        manage_inquiries: formData.manageInquiries,
                        traffic_url: formData.trafficUrl,
                    }
                ]);
            if (error) {
                console.error('Error inserting data:', error);
            } else {
                console.log('Data inserted:', data);
            }
        } catch (error) {
            console.error('Unexpected error:', error);
        }
    };

    // Handle continue button click
    const handleContinue = async () => {
        await storeDataInSupabase(); // Store the form data in Supabase
        navigate('/strategy-creation');
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Strategy Creation</h2>
            <p className={styles.description}>
                Introducing woortec - the ultimate social media ads product designed to elevate your online presence and drive results like never before. With woortec, you can effortlessly create and manage ads across multiple social media platforms, all in one place.
            </p>
            <div className={styles.tabContainer}>
                <StepIndicator />
            </div>
            <div className={styles.formContainer}>
                <div className={styles.formGroup}>
                    <label>What is the primary objective you aim to achieve with this investment?</label>
                    <select name="objective" className={styles.select} value={formData.objective} onChange={handleInputChange}>
                        <option value="">Select the best option</option>
                        <option value="brand-awareness">Brand Awareness</option>
                        <option value="reach">Reach</option>
                        <option value="engagement">Engagement</option>
                        <option value="sales">Sales</option>
                        <option value="lead-generation">Lead Generation</option>
                    </select>
                </div>
                <div className={styles.formGroup}>
                    <label>What is the budget you are willing to allocate for this campaign?</label>
                    <input
                        type="text"
                        name="budget"
                        className={styles.input}
                        placeholder="Enter the amount"
                        value={formData.budget}
                        onChange={handleInputChange}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label>Are you able to manage and respond to customer inquiries generated through this campaign?</label>
                    <div className={styles.radioGroup}>
                        <input
                            type="radio"
                            id="yes"
                            name="manageInquiries"
                            value="yes"
                            checked={formData.manageInquiries === 'yes'}
                            onChange={handleInputChange}
                        />
                        <label htmlFor="yes" className={styles.radioLabel}>Yes</label>
                        <input
                            type="radio"
                            id="no"
                            name="manageInquiries"
                            value="no"
                            checked={formData.manageInquiries === 'no'}
                            onChange={handleInputChange}
                        />
                        <label htmlFor="no" className={styles.radioLabel}>No</label>
                    </div>
                </div>
                <div className={styles.formGroup}>
                    <label>Where do you want to direct the traffic to?</label>
                    <input
                        type="text"
                        name="trafficUrl"
                        className={styles.input}
                        placeholder="Please enter a URL"
                        value={formData.trafficUrl}
                        onChange={handleInputChange}
                    />
                </div>
            </div>
            <button className={styles.continueButton} onClick={handleContinue}>
                Continue
            </button>
        </div>
    );
};

export default ObjectivePage;
