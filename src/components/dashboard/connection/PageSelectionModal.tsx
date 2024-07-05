import React from 'react';
import { Dialog, DialogTitle, DialogContent, List, ListItem, ListItemText, DialogActions, Button } from '@mui/material';

export interface PageSelectionModalProps {
  open: boolean;
  pages: { id: string; name: string }[];
  onClose: () => void;
  onSelect: (pageId: string) => void;
}

const PageSelectionModal = ({ open, pages, onClose, onSelect }: PageSelectionModalProps): React.JSX.Element => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Select a Facebook Page</DialogTitle>
      <DialogContent>
        <List>
          {pages.map((page) => (
            <ListItem button key={page.id} onClick={() => onSelect(page.id)}>
              <ListItemText primary={page.name} />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default PageSelectionModal;
