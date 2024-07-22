import React from 'react';
import { Modal, List, ListItem, ListItemText, Typography, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

interface PageSelectionModalProps {
  open: boolean;
  pages: { id: string; name: string }[];
  onClose: () => void;
  onSelect: (pageId: string) => void;
}

const PageSelectionModal: React.FC<PageSelectionModalProps> = ({ open, pages, onClose, onSelect }) => {
  return (
    <Modal open={open} onClose={onClose}>
      <div style={{ padding: '20px', background: 'white', margin: '50px auto', maxWidth: '400px' }}>
        <Typography variant="h6" gutterBottom>
          Select a Page
        </Typography>
        <IconButton onClick={onClose} style={{ position: 'absolute', right: '10px', top: '10px' }}>
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
