import React, { useState } from 'react';
import ObjectivePage from './setup01';
import StrategyCreationPage from './setup02';
import StrategyResultPage from './setup03';

const StrategyCreationFlow: React.FC = () => {
    // State to manage the current step in the process
    const [currentPage, setCurrentPage] = useState(1);

    const handleNext = () => {
        if (currentPage < 3) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handleBack = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        <div>
            {currentPage === 1 && <ObjectivePage />}
            {currentPage === 2 && <StrategyCreationPage />}
            {currentPage === 3 && <StrategyResultPage />}

            <div style={{ marginTop: '20px', textAlign: 'center' }}>
                {currentPage > 1 && (
                    <button onClick={handleBack} style={{ marginRight: '10px' }}>
                        Back
                    </button>
                )}
                {currentPage < 3 && (
                    <button onClick={handleNext}>
                        {currentPage === 2 ? 'View Result' : 'Next'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default StrategyCreationFlow;
