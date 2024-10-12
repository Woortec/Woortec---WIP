import React from 'react';
import styles from './styles/AvatarStep.module.css';

const AvatarStep: React.FC = () => {
  return (
    <div className={styles.container}>
      <h2>Paso 1/7: Crear el avatar</h2>
      <p>Asigna un nombre al buyer persona</p>
      <input type="text" placeholder="Asigna un nombre al buyer persona" />
      <div className={styles.avatarSelection}>
        <img src="avatar1.png" alt="Avatar 1" />
        <img src="avatar2.png" alt="Avatar 2" />
        <img src="avatar3.png" alt="Avatar 3" />
        <img src="avatar4.png" alt="Avatar 4" />
        <img src="avatar5.png" alt="Avatar 5" />
      </div>
      <button className={styles.nextButton}>Siguiente</button>
    </div>
  );
};

export default AvatarStep;
