import React, { useState, useEffect } from 'react';
import axios from 'axios';

function MessagesManagement() {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.get('http://localhost:5000/api/contact/messages?status=Pending', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setMessages(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      setLoading(false);
    }
  };

  const handleRespond = async (messageId) => {
    if (!response.trim()) {
      alert('Please enter a response');
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(
        `http://localhost:5000/api/contact/messages/${messageId}/respond`,
        { response, status: 'Resolved' },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      alert('Response sent successfully');
      setSelectedMessage(null);
      setResponse('');
      fetchMessages(); // Refresh list
    } catch (error) {
      alert('Failed to send response');
    }
  };

  if (loading) {
    return <div className="loading">Loading messages...</div>;
  }

  return (
    <div className="admin-section">
      <h2>Contact Messages</h2>
      <p>Pending Messages: {messages.length}</p>
      
      {messages.length === 0 ? (
        <p>No pending messages</p>
      ) : (
        <div className="messages-list">
          {messages.map((msg) => (
            <div key={msg.message_id} className="message-card">
              <div className="message-header">
                <h4>{msg.subject}</h4>
                <span className="message-date">
                  {new Date(msg.created_at).toLocaleString()}
                </span>
              </div>
              
              <div className="message-info">
                <p><strong>From:</strong> {msg.name} ({msg.email})</p>
                {msg.username && <p><strong>User:</strong> {msg.username}</p>}
              </div>
              
              <div className="message-content">
                <p><strong>Message:</strong></p>
                <p>{msg.message}</p>
              </div>
              
              {selectedMessage === msg.message_id ? (
                <div className="response-form">
                  <textarea
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder="Type your response..."
                    rows="4"
                  />
                  <div className="response-actions">
                    <button 
                      onClick={() => handleRespond(msg.message_id)}
                      className="btn btn-primary"
                    >
                      Send Response
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedMessage(null);
                        setResponse('');
                      }}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setSelectedMessage(msg.message_id)}
                  className="btn btn-primary"
                >
                  Respond
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MessagesManagement;