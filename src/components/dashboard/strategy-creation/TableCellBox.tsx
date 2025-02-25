import React from 'react';
import styles from './styles/TableCellBox.module.css';

interface TableCellBoxProps {
  children: React.ReactNode;
  className?: string;
  colSpan?: number;
}

const TableCellBox: React.FC<TableCellBoxProps> = ({ children, className, colSpan }) => {
  return (
    <div 
      className={`${styles.tableCellBox} ${className}`} 
      style={colSpan ? { gridColumn: `span ${colSpan}` } : undefined} // Apply colSpan-like effect
    >
      {children}
    </div>
  );
};

export default TableCellBox;