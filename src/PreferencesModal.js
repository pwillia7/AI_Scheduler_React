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
  Grid,
  makeStyles
} from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  textField: {
    margin: theme.spacing(1),
  },
}));

const getToday = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const PreferencesModal = ({ open, onClose, onSave }) => {
  const classes = useStyles();
  
  const [preferences, setPreferences] = useState({
    taskPreference: '',
    specificTimes: '',
    breakLength: '',
    breakFrequency: '',
    startTime: '07:00',
    endTime: '18:00',
    scheduleBreaks: true,
    scheduleMeals: true,
    mealPrefs: '',
    targetDay: getToday()  // Set default value to today
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
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Target Day"
              type="date"  // Set the type to date for a date picker
              value={preferences.targetDay}
              onChange={handlePreferenceChange('targetDay')}
              className={classes.textField}
              InputLabelProps={{
                shrink: true,
              }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Other Preferences"
              value={preferences.taskPreference}
              onChange={handlePreferenceChange('taskPreference')}
              className={classes.textField}
              placeholder='Don&apos;t schedule work tasks'
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Specific Times for Tasks"
              value={preferences.specificTimes}
              onChange={handlePreferenceChange('specificTimes')}
              className={classes.textField}
              placeholder='Personal tasks before 10'
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Break Length"
              value={preferences.breakLength}
              onChange={handlePreferenceChange('breakLength')}
              className={classes.textField}
              placeholder='20m'
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Break Frequency"
              value={preferences.breakFrequency}
              onChange={handlePreferenceChange('breakFrequency')}
              className={classes.textField}
              placeholder='At least 2 a day'
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Start Time"
              type="time"
              value={preferences.startTime}
              onChange={handlePreferenceChange('startTime')}
              InputLabelProps={{
                shrink: true,
              }}
              className={classes.textField}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="End Time"
              type="time"
              value={preferences.endTime}
              onChange={handlePreferenceChange('endTime')}
              InputLabelProps={{
                shrink: true,
              }}
              className={classes.textField}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
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
          </Grid>
          <Grid item xs={12} sm={6}>
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
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Meal Preferences"
              value={preferences.mealPrefs}
              onChange={handlePreferenceChange('mealPrefs')}
              className={classes.textField}
              placeholder='Early breakfast, late lunch, no dinner'
              fullWidth
            />
          </Grid>
        </Grid>
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
