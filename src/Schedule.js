import React from 'react';
import { Paper, Typography, List, ListItem, ListItemText, makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  paper: {
    margin: theme.spacing(2, 0),
    padding: theme.spacing(2),
  },
  scheduleHeader: {
    marginBottom: theme.spacing(2),
  },
  scheduleItem: {
    padding: theme.spacing(0.5, 0),
  },
}));

const Schedule = ({ schedule }) => {
  const classes = useStyles();

  return (
    <Paper className={classes.paper}>
      <Typography variant="h5" className={classes.scheduleHeader}>
        Generated Schedule:
      </Typography>
      <List dense>
        {schedule.map((entry, index) => (
          <ListItem key={index} className={classes.scheduleItem}>
            <ListItemText
              primary={`${entry.startTime} - ${entry.duration}`}
              secondary={entry.description}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default Schedule;
