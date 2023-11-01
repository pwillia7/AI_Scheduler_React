import React, { useState } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  makeStyles
} from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  textField: {
    margin: theme.spacing(1),
    width: '100%',
  },
}));

const PreferencesModal = ({ open, onClose, onSave }) => {
  const classes = useStyles();
  const [preferences, setPreferences] = useState({
    taskPreference: 'any',
    specificTimes: 'early morning personal tasks',
    breakLength: '20m',
    breakFrequency: 'at least 2',
    startTime: '06:00',
    endTime: '17:00',
    scheduleBreaks: true,
    scheduleMeals: true,
    mealPrefs: '20m breakfast 1hr lunch'
  });

  const handlePreferenceChange = (name) => (event) => {
    setPreferences({
      ...preferences,
      [name]: event.target.type === 'checkbox' ? event.target.checked : event.target.value
    });
  };

  const handleSave = () => {
    onSave(preferences);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="form-dialog-title">
      <DialogTitle id="form-dialog-title">Preferences</DialogTitle>
      <DialogContent>
        <TextField
          label="Task Preference"
          value={preferences.taskPreference}
          onChange={handlePreferenceChange('taskPreference')}
          className={classes.textField}
        />
        <TextField
          label="Specific Times for Tasks"
          value={preferences.specificTimes}
          onChange={handlePreferenceChange('specificTimes')}
          className={classes.textField}
        />
        <TextField
          label="Break Length"
          value={preferences.breakLength}
          onChange={handlePreferenceChange('breakLength')}
          className={classes.textField}
        />
        <TextField
          label="Break Frequency"
          value={preferences.breakFrequency}
          onChange={handlePreferenceChange('breakFrequency')}
          className={classes.textField}
        />
        <TextField
          label="Start Time"
          type="time"
          value={preferences.startTime}
          onChange={handlePreferenceChange('startTime')}
          InputLabelProps={{
            shrink: true,
          }}
          className={classes.textField}
        />
        <TextField
          label="End Time"
          type="time"
          value={preferences.endTime}
          onChange={handlePreferenceChange('endTime')}
          InputLabelProps={{
            shrink: true,
          }}
          className={classes.textField}
        />
        <FormControlLabel
          control={
            <Switch
              checked={preferences.scheduleBreaks}
              onChange={handlePreferenceChange('scheduleBreaks')}
              color="primary"
            />
          }
          label="Schedule Breaks"
        />
        <FormControlLabel
          control={
            <Switch
              checked={preferences.scheduleMeals}
              onChange={handlePreferenceChange('scheduleMeals')}
              color="primary"
            />
          }
          label="Schedule Meals"
        />
        <TextField
          label="Meal Preferences"
          value={preferences.mealPrefs}
          onChange={handlePreferenceChange('mealPrefs')}
          className={classes.textField}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSave} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PreferencesModal;
