import React from 'react';
import styles from './styles/BusinessStep.module.css';

const BusinessStep: React.FC = () => {
  return (
    <div className={styles.container}>
      <h2>Paso 3/7: Negocio</h2>
      <p>¿Cuál es su industria?</p>
      <input type="text" placeholder="Selecciona una industria" />
      <p>¿Qué tamaño tiene la organización?</p>
      <input type="range" min="0" max="100" />
      <button className={styles.nextButton}>Siguiente</button>
    </div>
  );
};

export default BusinessStep;
