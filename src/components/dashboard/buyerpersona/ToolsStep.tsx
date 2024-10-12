import React from 'react';
import styles from './styles/ToolsStep.module.css';

const ToolsStep: React.FC = () => {
  return (
    <div className={styles.container}>
      <h2>Paso 6/7: Con qué herramientas trabaja</h2>
      <p>¿Qué herramientas usa o necesita para hacer su trabajo?</p>
      <div className={styles.checkboxes}>
        <label><input type="checkbox" /> Software de CRM</label>
        <label><input type="checkbox" /> Gestión de proyectos</label>
        <label><input type="checkbox" /> Correo electrónico</label>
        <label><input type="checkbox" /> Software de facturación</label>
      </div>
      <button className={styles.nextButton}>Siguiente</button>
    </div>
  );
};

export default ToolsStep;
