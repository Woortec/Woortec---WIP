import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, List, ListItem, ListItemText } from '@mui/material';

interface AdAccountSelectionModalProps {
  open: boolean;
  adAccounts: { id: string; name: string }[];
  onClose: () => void;
  onSelect: (accountId: string) => void;
}

const AdAccountSelectionModal: React.FC<AdAccountSelectionModalProps> = ({ open, adAccounts, onClose, onSelect }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Select Ad Account</DialogTitle>
      <DialogContent>
        <List>
          {adAccounts.map((account) => (
            <ListItem button key={account.id} onClick={() => onSelect(account.id)}>
              <ListItemText primary={account.name} secondary={account.id} />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdAccountSelectionModal;
