import React, { useState, useEffect } from 'react';
import {
  Button,
  TextField,
  Container,
  CssBaseline,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  CircularProgress,
  makeStyles
} from '@material-ui/core';

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import PreferencesModal from './PreferencesModal';
import Schedule from './Schedule';  // Assuming a new Schedule component is created for better rendering of schedule entries

const useStyles = makeStyles((theme) => ({
  scheduleEntry: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(1),
    marginBottom: theme.spacing(1),
    border: '1px solid #ddd',
    borderRadius: '4px',
  },
}));

function App() {
  const classes = useStyles();

  const [preferences, setPreferences] = useState(null);
  const [icsFile, setIcsFile] = useState(null);  // Changed initial state to null
  const [tasksText, setTasksText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [schedule, setSchedule] = useState(null);
  const [questions, setQuestions] = useState(null);
  const [answers, setAnswers] = useState(Array(questions?.length || 0).fill(""));
  const [isAccepted, setIsAccepted] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sessionId, setSessionId] = useState('');


  
  

  useEffect(() => {
    const fetchSessionId = async () => {
      try {
        const response = await fetch('http://localhost:5000/start_session');
        if (!response.ok) {
          throw new Error('Network response was not ok ' + response.statusText);
        }
        const data = await response.json();
        setSessionId(data.session_id);
      } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
      }
    };

    fetchSessionId();
    loadPreferences();
}, []);

const handleFeedbackSubmit = async () => {
  const response = await fetch('http://localhost:5000/revise_schedule', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': sessionId,
      },
      body: JSON.stringify({ session_id: sessionId, feedback }),
  });

  if (response.ok) {
      const responseData = await response.json();
      if (responseData.questions && responseData.questions.length !== 0) {
          setQuestions(responseData.questions);
      } else if (responseData.schedule) {
          setSchedule(null);
          setSchedule(parseSchedule(responseData.schedule));
      }
  } else {
      console.error('Network error:', response.statusText);
  }
};


const handleAnswerChange = (index, value) => {
  setAnswers((prevAnswers) => ({
    ...prevAnswers,
    [index]: value
  }));
};

const handlePreferencesSave = (prefs) => {
  setPreferences(prefs);
  setIsModalOpen(false);
  // Save preferences to localStorage
  localStorage.setItem('userPreferences', JSON.stringify(prefs));
};

const loadPreferences = () => {
  // Load preferences from localStorage
  const savedPreferences = localStorage.getItem('userPreferences');
  if (savedPreferences) {
    setPreferences(JSON.parse(savedPreferences));
  }
};

const renderQuestions = () => {
  return questions && (
    <div>
      <h2>Questions from GPT-4:</h2>
      {questions.map((question, index) => (
        <div key={index} style={{ marginBottom: '10px' }}>
          <TextField
            label={question}
            value={answers[index] || ''}
            onChange={(e) => handleAnswerChange(index, e.target.value)}
            variant="outlined"
            fullWidth
          />
        </div>
      ))}
      <Button
        variant="contained"
        color="secondary"
        onClick={handleAnswersSubmit}
        disabled={loading}
      >
        Submit Answers
      </Button>
    </div>
  );
};

const handleAccept = () => {
  setIsAccepted(true);
};

const handleReject = async () => {
  // Assuming feedback is to be sent as part of a request to generate a new schedule
  const requestBody = {
    feedback,
    // ...other necessary data
  };
  const response = await fetch('http://localhost:5000/submit_feedback', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Session-ID': sessionId,
    },
    body: JSON.stringify(requestBody),
  });

  if (response.ok) {
    const responseData = await response.json();
    // Assuming a new schedule is returned
    setSchedule(parseSchedule(responseData.schedule));
    setFeedback('');  // Reset feedback
  } else {
    console.error('Network error:', response.statusText);
  }
};
const renderAnswers = () => {
    return (
      <div>
        <TextField
          multiline
          rows={4}
          placeholder="Enter feedback..."
          variant="outlined"
          fullWidth
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          style={{ marginBottom: '20px' }}
        />
        <Button
          variant="contained"
          color="secondary"
          onClick={handleFeedbackSubmit}
          style={{ marginBottom: '20px' }}
        >
          Submit Feedback
        </Button>
        {schedule.map((entry, index) => (
          <div key={index} className={classes.scheduleEntry}>
            <div>{entry.startTime} - {entry.duration}</div>
            <div>{entry.description}</div>
          </div>
        ))}
        <Button
          variant="contained"
          color="primary"
          onClick={handleDownload}
        >
          Download Schedule
        </Button>
      </div>
    );
  };



const handleGenerateSchedule = async () => {
  // Convert file to Base64
  const reader = new FileReader();
  reader.readAsDataURL(icsFile);
  reader.onload = async () => {
    const base64File = reader.result.split(',')[1];  // Remove the data URL prefix
    const requestBody = {
      ics_file: base64File,
      tasks_text: tasksText,
      preferences: preferences,
      target_day: preferences.targetDay, 

    };

    const response = await fetch('http://localhost:5000/generate_schedule', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-ID': sessionId,
      },
      body: JSON.stringify(requestBody),
    });

    if (response.ok) {
      const responseData = await response.json();
      setSessionId(responseData.session_id);  // Save session_id to state
      if (responseData.status === 'questions') {
        setQuestions(responseData.questions);
      } else if (responseData.status === 'success') {
        setQuestions(null);  // clear the questions state
        setSchedule(parseSchedule(responseData.schedule));
      } else {
        console.error('Error generating schedule:', responseData.error);
      }
    } else {
      console.error('Network error:', response.statusText);
    }
  };
};
const parseSchedule = (scheduleArray) => {
  return scheduleArray.map(entry => {
    const [startTime, duration, ...descriptionArray] = entry.split(', ');
    const description = descriptionArray.join(', ');  // In case description contains commas
    console.log({ startTime, duration, description})
    return { startTime, duration, description };
  });
};

  const handleAnswersSubmit = async () => {
    
    const response = await fetch('http://localhost:5000/submit_answers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-ID': sessionId,
      },
      body: JSON.stringify({ answers, session_id: sessionId }),  // send answers and session_id to server
    });

    if (response.ok) {
      const responseData = await response.json();
      if (responseData.status === 'success') {
        setQuestions(null);  // clear the questions state
        setSchedule(parseSchedule(responseData.schedule));
      } else {
        console.error('Error submitting answers:', responseData.error);
      }
    } else {
      console.error('Network error:', response.statusText);
    }
  };
  const renderContent = () => {
    if (loading) {
      return (
        <div style={{ textAlign: 'center', margin: '20px 0' }}>
          <CircularProgress />
        </div>
      );
    }

    if (questions && questions.length > 0) {
      return renderQuestions();
    } else if (schedule) {
      return renderAnswers();
    } else {
      return null;
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(`http://localhost:5000/download_schedule?session_id=${sessionId}`);
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'schedule.ics';  // The name of downloaded file
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('There has been a problem with your fetch operation:', error);
    }
  };

  const isGenerateButtonDisabled = !preferences || !icsFile || !tasksText;
  
  return (
    <Container component="main">
      <CssBaseline />
      <Typography variant="h5" component="h2" style={{ margin: '20px 0' }}>
        Welcome to GPT Scheduler
      </Typography>
      <Typography paragraph>
        Configure your preferences, upload your ICS file and enter your tasks to generate a schedule. 
        For more details, <a href="/instructions">click here</a> or visit our <a href="https://github.com/your-repo-link">GitHub repository</a>.
      </Typography>
      <form encType="multipart/form-data">
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
            <Typography>File Upload and Preferences</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <div style={{ width: '100%' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setIsModalOpen(true)}
                disabled={loading}
              >
                Configure Preferences
              </Button>
              <PreferencesModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handlePreferencesSave}
              />
              <input
                type="file"
                accept=".ics"
                onChange={(e) => setIcsFile(e.target.files[0])}
                disabled={loading}
              />
              <TextField
                multiline
                rows={10}
                placeholder="Enter tasks here..."
                variant="outlined"
                fullWidth
                onChange={(e) => setTasksText(e.target.value)}
                disabled={loading}
              />
              <Button
                variant="contained"
                color="secondary"
                disabled={isGenerateButtonDisabled || loading}
                onClick={handleGenerateSchedule}
              >
                Generate Schedule
              </Button>
            </div>
          </AccordionDetails>
        </Accordion>
        {renderContent()}
        {error && <div style={{ color: 'red' }}>{error}</div>}
      </form>
    </Container>
  );
}

export default App;
