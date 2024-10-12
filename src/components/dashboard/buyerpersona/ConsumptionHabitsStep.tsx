import React from 'react';
import styles from './styles/ConsumptionHabitsStep.module.css';

const ConsumptionHabitsStep: React.FC = () => {
  return (
    <div className={styles.container}>
      <h2>Paso 7/7: Hábitos de consumo</h2>
      <p>¿Cómo obtienen la información que necesitan para hacer su trabajo?</p>
      <textarea placeholder="Describe tus hábitos de consumo" />
      <p>¿Qué redes sociales usan?</p>
      <div className={styles.socialMedia}>
        <label><input type="checkbox" /> Facebook</label>
        <label><input type="checkbox" /> Instagram</label>
        <label><input type="checkbox" /> Twitter</label>
        <label><input type="checkbox" /> LinkedIn</label>
      </div>
      <button className={styles.nextButton}>Siguiente</button>
    </div>
  );
};

export default ConsumptionHabitsStep;
