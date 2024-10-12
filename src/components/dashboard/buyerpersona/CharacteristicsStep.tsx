import React from 'react';
import styles from './styles/CharacteristicsStep.module.css';

const CharacteristicsStep: React.FC = () => {
  return (
    <div className={styles.container}>
      <h2>Paso 5/7: Características del trabajo</h2>
      <p>¿Cuáles son sus metas y objetivos?</p>
      <input type="text" placeholder="Escribe tus metas" />
      <p>¿Cuáles son sus mayores desafíos?</p>
      <textarea placeholder="Describe tus desafíos" />
      <button className={styles.nextButton}>Siguiente</button>
    </div>
  );
};

export default CharacteristicsStep;
