import React from 'react';
import styles from './styles/TableCellBox.module.css';

interface TableCellBoxProps {
  children: React.ReactNode;
  className?: string;
}

const TableCellBox: React.FC<TableCellBoxProps> = ({ children, className }) => {
  return <div className={`${styles.tableCellBox} ${className}`}>{children}</div>;
};

export default TableCellBox;
