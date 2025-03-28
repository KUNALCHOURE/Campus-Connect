import React, { useState } from 'react';
import './ChatInterface.css';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (inputMessage.trim() === '') return;

    setMessages(prev => [...prev, { text: inputMessage, sender: 'user' }]);
    const messageToSend = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: messageToSend })
      });

      const data = await response.json();
      setMessages(prev => [...prev, { 
        text: data.response,
        sender: 'bot' 
      }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        text: "Sorry, I'm having trouble connecting to the server.", 
        sender: 'bot' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        // Create FormData
        const formData = new FormData();
        formData.append('image', file);

        // First upload the image
        const uploadResponse = await fetch('http://localhost:5000/upload-image', {
          method: 'POST',
          body: formData
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload image');
        }

        const uploadData = await uploadResponse.json();

        // Add the image to chat
        setMessages(prev => [...prev, {
          text: uploadData.imageUrl,
          sender: 'user',
          isImage: true
        }]);

        // Get analysis of the image
        const analysisResponse = await fetch('http://localhost:5000/analyze-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ imageUrl: uploadData.imageUrl })
        });

        if (!analysisResponse.ok) {
          throw new Error('Failed to analyze image');
        }

        const analysisData = await analysisResponse.json();
        setMessages(prev => [...prev, {
          text: analysisData.response,
          sender: 'bot'
        }]);

      } catch (error) {
        console.error('Error:', error);
        setMessages(prev => [...prev, {
          text: "Sorry, I couldn't process the image. Please try again.",
          sender: 'bot'
        }]);
      }
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Campus Connect AI Assistant</h2>
      </div>
      
      <div className="messages-container">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
            style={{
              alignSelf: message.sender === 'user' ? 'flex-end' : 'flex-start',
              textAlign: message.sender === 'user' ? 'right' : 'left'
            }}
          >
            {message.isImage ? (
              <img 
                src={message.text} 
                alt="Uploaded" 
                style={{
                  maxWidth: '300px',
                  borderRadius: '10px',
                  display: 'block',
                  margin: message.sender === 'user' ? 'left' : 'right'
                }} 
              />
            ) : (
              message.text
            )}
          </div>
        ))}
        {isLoading && (
          <div className="message bot-message loading">
            Thinking...
          </div>
        )}
      </div>

      <form className="input-container" onSubmit={handleSendMessage}>
        <label className="upload-button" title="Upload image">
          <input
            type="file"
            className="upload-input"
            accept="image/*"
            onChange={handleFileUpload}
          />
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#1e90ff">
            <path d="M19.5 12c0-4.14-3.36-7.5-7.5-7.5S4.5 7.86 4.5 12s3.36 7.5 7.5 7.5 7.5-3.36 7.5-7.5zM12 3c4.97 0 9 4.03 9 9s-4.03 9-9 9-9-4.03-9-9 4.03-9 9-9zm0 14l-4-4h8l-4 4zm0-6l4-4H8l4 4z"/>
          </svg>
        </label>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;