import React from 'react';
import styles from './styles/ProfessionalPathStep.module.css';

const ProfessionalPathStep: React.FC = () => {
  return (
    <div className={styles.container}>
      <h2>Paso 4/7: Trayectoria profesional</h2>
      <p>¿Cuál es su puesto?</p>
      <input type="text" placeholder="Escribe tu puesto" />
      <p>¿Cómo se miden sus resultados?</p>
      <textarea placeholder="Describe cómo se miden tus resultados" />
      <button className={styles.nextButton}>Siguiente</button>
    </div>
  );
};

export default ProfessionalPathStep;
