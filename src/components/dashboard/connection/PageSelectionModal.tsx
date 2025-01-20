import React from 'react';
import { Modal, List, ListItem, ListItemText, Typography, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import styles from './styles/Connect.module.css';

interface PageSelectionModalProps {
  open: boolean;
  pages: { id: string; name: string }[];
  onClose: () => void;
  onSelect: (pageId: string) => void;
}

const PageSelectionModal: React.FC<PageSelectionModalProps> = ({ open, pages, onClose, onSelect }) => {
  return (
    <Modal open={open} onClose={onClose}>
      <div className={styles.modalContent}>
        <Typography variant="h6" gutterBottom>
          Select a Page
        </Typography>
        <IconButton onClick={onClose} className={styles.closeButton}>
          <CloseIcon />
        </IconButton>
        <List>
          {pages.map((page) => (
            <ListItem button key={page.id} onClick={() => onSelect(page.id)}>
              <ListItemText primary={page.name} secondary={page.id} />
            </ListItem>
          ))}
        </List>
      </div>
    </Modal>
  );
};

export default PageSelectionModal;