import React from 'react';
import styles from './styles/DemographicStep.module.css';

const DemographicStep: React.FC = () => {
  return (
    <div className={styles.container}>
      <h2>Paso 2/7: Datos Demográficos</h2>
      <p>¿Cuántos años tiene?</p>
      <input type="number" placeholder="Escribe tu edad" />
      <p>¿Cuál es el nivel de educación más alto que alcanzó?</p>
      <input type="text" placeholder="Escribe tu nivel de educación" />
      <button className={styles.nextButton}>Siguiente</button>
    </div>
  );
};

export default DemographicStep;
