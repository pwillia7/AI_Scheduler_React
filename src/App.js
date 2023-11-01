import React, { useState, useEffect } from 'react';
import { Button, TextField, Container, CssBaseline } from '@material-ui/core';
import PreferencesModal from './PreferencesModal';

function App() {
  const [preferences, setPreferences] = useState(null);
  const [icsFile, setIcsFile] = useState(null);  // Changed initial state to null
  const [tasksText, setTasksText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [schedule, setSchedule] = useState(null);
  const [questions, setQuestions] = useState(null);
  const [answers, setAnswers] = useState(Array(questions?.length || 0).fill(""));
  const [isAccepted, setIsAccepted] = useState(false);
  const [feedback, setFeedback] = useState('');

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
              <div key={index}>
                  <p>{`${index + 1}. ${question}`}</p>
                  <TextField
                      label={`Answer ${index + 1}`}
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
          <Button
              variant="contained"
              color="primary"
              onClick={handleDownload}
          >
              Download Schedule
          </Button>
          {schedule && (
              <div>
                  <h2>Generated Schedule:</h2>
                  {schedule.map((entry, index) => (
                      <div key={index}>
                          {entry.startTime} - {entry.duration} - {entry.description}
                      </div>
                  ))}
              </div>
          )}
          <TextField
              multiline
              rows={4}
              placeholder="Enter feedback..."
              variant="outlined"
              fullWidth
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
          />
          <Button
              variant="contained"
              color="secondary"
              onClick={handleFeedbackSubmit}
          >
              Submit Feedback
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
    if (questions && questions.length > 0) {
      return renderQuestions();
    } else if (schedule) {
      return renderAnswers();
    } else {
      return null;  // Render nothing if no questions and no schedule
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
      <form encType="multipart/form-data">
          <Button
              variant="contained"
              color="primary"
              onClick={() => setIsModalOpen(true)}
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
          />
          <TextField
              multiline
              rows={10}
              placeholder="Enter tasks here..."
              variant="outlined"
              fullWidth
              onChange={(e) => setTasksText(e.target.value)}
          />
          <Button
              variant="contained"
              color="secondary"
              disabled={isGenerateButtonDisabled}
              onClick={handleGenerateSchedule}
          >
              Generate Schedule
          </Button>
          {renderContent()}
      </form>
  </Container>
);
}

export default App;
