import React, { useState } from 'react';
import styles from './styles/FinalAvatarStep.module.css';

interface FinalAvatarStepProps {
  selectedAvatar: number | null; // Add prop for selectedAvatar
  customerName: string; // New prop for customer name
  age: number; // Prop for age
  location: string; // New prop for location
  gender: string; // Add gender as a prop
  setAge: (newAge: number) => void; // New prop for setting age              
  setGender: (gender: string) => void; // Setter for gender
  language: string; // New prop for language
  setLanguage: (language: string) => void; // Setter for language
  job: string; // New prop for customer name
  education: string; // New prop for language
  setEducation: (education: string) => void; // Setter for language
  annualIncome: string; // Add prop for customer name
  setAnnualIncome: (annualIncome: string) => void; // Add setter function
  website: string;
  setWebsite: (website: string) => void; // Add setter function
  read: string;
  setRead: (read: string) => void; // Add setter function
  genre: string;
  setGenre: (genre: string) => void; // Add setter function
  goals: string;
  setGoals: (goals: string) => void; // Add setter function
  challenges: string;
  setChallenges: (challenges: string) => void; // Add setter function
  purchase: string;
  setPurchase: (purchase: string) => void; // Add setter function
  hobbies: string;
  setHobbies: (purchase: string) => void; // Add setter function
  skill: string;
  setSkill: (purchase: string) => void; // Add setter function
  selectedPlatforms: string[]; // Consistent prop name for clarity
  setSelectedPlatforms: (platforms: string[]) => void;

  // EventHandlerProps
  handleReturnToMainMenu: () => void; // Add this prop
  handleNameChange: (newName: string) => void; // New prop for handling name changes
  handleLocationChange: (newName: string) => void; // New prop for handling location changes
  handleJobChange: (newJob: string) => void; // Add this line


}

const FinalAvatarStep: React.FC<FinalAvatarStepProps> = ({selectedAvatar, 
  customerName,
  job,  
  age,
  location,
  language,
  setAge,
  gender,
  setGender,
  setLanguage,
  education, // Add this line
  setEducation, // Add this line
  annualIncome,
  setAnnualIncome,
  website,
  setWebsite,
  read,
  setRead,
  genre,
  setGenre,
  goals,
  setGoals,
  challenges,
  setChallenges,
  purchase,
  setPurchase,
  hobbies,
  setHobbies,
  skill,
  setSkill,
  selectedPlatforms,
  setSelectedPlatforms,
  

  // EventHandler
  handleNameChange,
  handleReturnToMainMenu,
  handleLocationChange,
  handleJobChange 
 }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState("");

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

    // Function to handle auto-resizing of textarea
    const handleResize = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const target = event.target;
      target.style.height = 'auto'; // Reset height
      target.style.height = `${target.scrollHeight}px`; // Set height to scroll height
    };

    const handleGenderChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setGender(event.target.value); // Update gender based on textarea input
    };

  return (
<div className={styles.wrapper}>

{/*THIS IS FOR MODAL ONLY*/}
{isModalOpen && (
  <div className={styles.modalOverlay} onClick={closeModal}>
    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
      {/* Close Button */}
      <button onClick={closeModal} className={styles.modalCloseButton}>
        &times;
      </button>
      
      <h2 className={styles.modalHeader}>Download or Share Your Persona</h2>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email Address"
        className={styles.emailInput}
      />
      <div className={styles.modalButtons}>
        <button
          onClick={() => {
            /* Handle save/download with the email */
            closeModal();
          }}
          className={styles.modalSubmit}
        >
          Submit
        </button>
      </div>
    </div>
  </div>
)}

<div className={styles.mainContainer}> {/*Whole Page*/}
  <div><button className={styles.returnButton} onClick={handleReturnToMainMenu}>← RETURN TO HOMEPAGE</button></div>

  <div className={styles.header}>
    Make My Persona Overview
    <div className={styles.buttonsContainer}>
      <button className={styles.saveButton} onClick={openModal}>Save</button>
      <button className={styles.dlButton} onClick={openModal}>Download</button>
    </div>
  </div>

  <div className={styles.container}> {/*For the whole columns*/}

    {/* First Row */}
    <div className={styles.firstRow}>

      <div className={styles.fcolumnbox}>{/* First Column of First Row */}

        <div className={styles.fleftcolumn}>
          {selectedAvatar !== null && (
            <div className={styles.selectedAvatarLeft}>
              <img
                src={`/assets/avatar-${selectedAvatar + 1}.png`}
                alt={`Selected Avatar ${selectedAvatar + 1}`}
                className={styles.selectedAvatarImage}
              />
            </div>
          )}
        </div>   

        <div className={styles.frightcolumn}>

          <div className={styles.frowup}>
          Name
          <div><textarea className={styles.flrText} placeholder="Enter text here" onInput={handleResize} value={`${customerName}`} onChange={(e) => handleNameChange(e.target.value)}></textarea></div>
          </div>

          <div className={styles.frowdown}>

            <div className={styles.frowdownleft}>
              <div className={styles.frowdownleftup}>
                Location:
                <div><textarea className={styles.flText} placeholder="Enter text here" onInput={handleResize} value={`${location}`} onChange={(e) => handleLocationChange(e.target.value)}></textarea></div>
              </div>
              <div className={styles.frowdownleftdown}>
                Language:
                <div><textarea className={styles.flText} placeholder="Enter text here" onInput={handleResize} value={`${language}`} onChange={(e) => setLanguage(e.target.value)}></textarea></div>
              </div>
            </div>

            <div className={styles.frowdownright}>
              <div className={styles.frowdownrightup}>
                Age:
                <div><textarea className={styles.flText} placeholder="Enter text here" onInput={handleResize} value={`${age}`} onChange={(e) => setAge(Number(e.target.value))}></textarea></div>
              </div>
              <div className={styles.frowdownrightdown}>
                Gender:
                <div><textarea className={styles.flText} placeholder="Enter text here" onInput={handleResize} value={`${gender}`} onChange={(e) => setGender(e.target.value)}></textarea></div>
                </div>
            </div>
          </div>
        </div>  
      </div>

      <div className={styles.scolumnbox}>{/* 2nd Column of First Row */}
        <div className={styles.scolbox}>
          Job Title
        <div><textarea className={styles.scolText} placeholder="Enter text here" onInput={handleResize} value={`${job}`} onChange={(e) => handleJobChange(e.target.value)}></textarea></div>
        </div>
      </div>

      <div className={styles.scolumnbox}>{/* 3rd Column of First Row */}
        <div className={styles.scolbox}>
          Highest Education
          <div><textarea className={styles.scolText} placeholder="Enter text here" onInput={handleResize} value={`${education}`} onChange={(e) => setEducation(e.target.value)}></textarea></div>
        </div>
      </div>

    </div>

    {/* 2nd Row */}
    <div className={styles.secondRow}>    {/* F Row */}

      {/* 5 ColumnBoxes of 2nd Row */}
      <div className={styles.secondcolumnbox}>
        <div className={styles.secondrowboxes}>
        Annual Income
          <div><textarea className={styles.secText} placeholder="Enter text here" onInput={handleResize} value={`${annualIncome}`} onChange={(e) => setAnnualIncome(e.target.value)}></textarea></div>
        </div>
      </div>

      <div className={styles.secondcolumnbox}>
        <div className={styles.secondrowboxes}>
          Websites often visited
          <div><textarea className={styles.secText} placeholder="Enter text here" onInput={handleResize} value={`${website}`} onChange={(e) => setWebsite(e.target.value)}></textarea></div>
        </div>
      </div>

      <div className={styles.secondcolumnbox}>
        <div className={styles.secondrowboxes}>
            Regularly read
            <div><textarea className={styles.secText} placeholder="Enter text here" onInput={handleResize} value={`${read}`} onChange={(e) => setRead(e.target.value)}></textarea></div>
          </div>
      </div>

      <div className={styles.secondcolumnbox}>
        <div className={styles.secondrowboxes}>
            Film Genres Liked
            <div><textarea className={styles.secText} placeholder="Enter text here" onInput={handleResize} value={`${genre}`} onChange={(e) => setGenre(e.target.value)}></textarea></div>
          </div>
      </div>

      <div className={styles.secondcolumnbox}>
        <div className={styles.secondrowboxes}>
            Goals and Motivations
            <div><textarea className={styles.secText} placeholder="Enter text here" onInput={handleResize} value={`${goals}`} onChange={(e) => setGoals(e.target.value)}></textarea></div>
          </div>  
      </div>

    </div>

    {/* rnd Row */}
    <div className={styles.secondRow}>    {/* F Row */}

      {/* 5 ColumnBoxes of 3rd Row */}
      <div className={styles.secondcolumnbox}>
        <div className={styles.secondrowboxes}>
          Challenges/Obstacles
          <div><textarea className={styles.secText} placeholder="Enter text here" onInput={handleResize} value={`${challenges}`} onChange={(e) => setChallenges(e.target.value)}></textarea></div>
          </div>  
      </div>

      <div className={styles.secondcolumnbox}>
        <div className={styles.secondrowboxes}>
          Purchase Barriers
          <div><textarea className={styles.secText} placeholder="Enter text here" onInput={handleResize} value={`${purchase}`} onChange={(e) => setPurchase(e.target.value)}></textarea></div>
          </div>  
      </div>

      <div className={styles.secondcolumnbox}>
        <div className={styles.secondrowboxes}>
          Hobbies/Activities
        <div><textarea className={styles.secText} placeholder="Enter text here" onInput={handleResize} value={`${hobbies}`} onChange={(e) => setHobbies(e.target.value)}></textarea></div>
          </div>    
      </div>

      <div className={styles.secondcolumnbox}>
        <div className={styles.secondrowboxes}>
          Skills
          <div><textarea className={styles.secText} placeholder="Enter text here" onInput={handleResize}
        value={`${skill}`} onChange={(e) => setSkill(e.target.value)}
        ></textarea></div>
          </div>    
      </div>

      <div className={styles.secondcolumnbox}>
      <div className={styles.secondrowboxes}>
      Social Media
        <div>
        <textarea
      className={styles.secText}
      placeholder="Enter text here"
      onInput={handleResize}
      value={selectedPlatforms.join(', ')}
      onChange={(e) => {
        const newPlatforms = e.target.value.split(',').map(s => s.trim());
        setSelectedPlatforms(newPlatforms);
      }}
    />
        </div>
          </div> 
          
      </div>

    </div>

  </div>


  </div>

</div>


)};

export default FinalAvatarStep;
