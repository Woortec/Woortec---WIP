import React, { useState } from 'react';
import styles from './styles/CampaignDetailsForm.module.css';
import ProgressBar from './ProgressBar';

const CampaignDetailsForm: React.FC<{ nextStep: () => void }> = ({ nextStep }) => {
  const [formDetails, setFormDetails] = useState({
    objective: '',
    engagementObjective: '',
    messagesEnabled: '',
    messagesEstimate: '',
    trafficDestination: '',
    investmentAmount: '',
    audience: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormDetails({ ...formDetails, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('campaignDetails', JSON.stringify(formDetails));
    nextStep();
  };

  const handleObjectiveChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormDetails({ ...formDetails, objective: e.target.value });
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Strategy Creation</h1>
      <ProgressBar step={1} />
      <form onSubmit={handleSubmit} className={styles.formContainer}>
        <div className={styles.formContent}>
          <div className={styles.column}>
            <div className={styles.questionGroup}>
              <label className={styles.question}>What is your objective with this investment?</label>
              <select
                name="objective"
                value={formDetails.objective}
                onChange={handleObjectiveChange}
                className={styles.input}
              >
                <option value="">Select the best option</option>
                <option value="engagement">Engagement is the core, are you trying to increase your brand awareness and community?</option>
                <option value="sales">Sales need to come. Do you want to increase the traffic to your website?</option>
                <option value="dataCollectionQuick">Do you want to collect data from potential customers through a quick form? Results are not as accurate as they could be, but you can create a big database of potential buyers.</option>
                <option value="dataCollectionLanding">Do you want to collect data from clients who are really interested in the product? Let's send them to a landing page.</option>
                <option value="leads">Do you have a landing page? Let's set a Leads Campaign to direct the traffic there.</option>
              </select>
            </div>

            {formDetails.objective && (
              <div className={styles.questionGroup}>
                <label className={styles.question}>{formDetails.objective}</label>
                <textarea
                  name="engagementObjective"
                  value={formDetails.engagementObjective}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Describe more about your objective..."
                />
              </div>
            )}

            <div className={styles.questionGroup}>
              <label className={styles.question}>Are you able to answer messages?</label>
              <select
                name="messagesEnabled"
                value={formDetails.messagesEnabled}
                onChange={handleChange}
                className={styles.input}
              >
                <option value="">Select Yes or No</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            {formDetails.messagesEnabled === 'yes' && (
              <div className={styles.questionGroup}>
                <p className={styles.description}>
                  Expected amount of messages: 75 Messages per day per $100 invested.
                </p>
              </div>
            )}

            <div className={styles.questionGroup}>
              <label className={styles.question}>Where do you want to direct the traffic?</label>
              <input
                type="text"
                name="trafficDestination"
                value={formDetails.trafficDestination}
                onChange={handleChange}
                className={styles.input}
                placeholder="Enter the URL"
              />
            </div>

            <div className={styles.questionGroup}>
              <label className={styles.question}>How much money are you willing to invest?</label>
              <input
                type="text"
                name="investmentAmount"
                value={formDetails.investmentAmount}
                onChange={handleChange}
                className={styles.input}
                placeholder="$0.00"
              />
            </div>
          </div>

          <div className={styles.column}>
            <div className={styles.questionGroup}>
              <label className={styles.question}>Audience</label>
              <textarea
                name="audience"
                value={formDetails.audience}
                onChange={handleChange}
                className={styles.input}
                placeholder="The best way to improve your ads' performance is to be very clear with the target audience. Please fill in the buyer persona (link to buyer persona)."
              />
            </div>
          </div>
        </div>
        <div className={styles.buttonContainer}>
          <button type="submit" className={styles.submitButton}>
            Continue
          </button>
        </div>
      </form>
    </div>
  );
};

export default CampaignDetailsForm;
