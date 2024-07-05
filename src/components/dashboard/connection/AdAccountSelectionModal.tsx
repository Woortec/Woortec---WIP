import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, List, ListItem, ListItemText, Card, CardContent, Typography } from '@mui/material';

interface AdAccount {
  id: string;
  name: string;
}

interface AdAccountSelectionModalProps {
  open: boolean;
  adAccounts: AdAccount[];
  onClose: () => void;
  onSelect: (accountId: string) => void;
}

const AdAccountSelectionModal: React.FC<AdAccountSelectionModalProps> = ({ open, adAccounts, onClose, onSelect }) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Select Ad Account</DialogTitle>
      <DialogContent>
        <List>
          {adAccounts.map((account) => (
            <Card key={account.id} sx={{ marginBottom: 2 }}>
              <CardContent>
                <ListItem button onClick={() => onSelect(account.id)}>
                  <ListItemText
                    primary={<Typography variant="h6">{account.name}</Typography>}
                    secondary={account.id}
                  />
                  <Button variant="contained" color="primary">
                    Select
                  </Button>
                </ListItem>
              </CardContent>
            </Card>
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
