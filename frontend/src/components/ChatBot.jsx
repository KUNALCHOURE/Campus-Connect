import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { FaPaperPlane, FaRobot, FaUser } from 'react-icons/fa';
import api from '../services/api';
const ChatBot = () => {
    const MESSAGE_LIMIT = 10;
    const [messages, setMessages] = useState([]);
    const [limitedHistory, setLimitedHistory] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim()) return;

        const userMessage = inputMessage.trim();
        setInputMessage('');
        setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);
        const newHistory = [...messages, { text: userMessage, sender: 'user' }];
        const limited = newHistory.length > MESSAGE_LIMIT ? newHistory.slice(newHistory.length - MESSAGE_LIMIT) : newHistory;
        setLimitedHistory(limited);
        setIsLoading(true);

        try {
            const response = await api.post('/chat/chat', {
                message: userMessage,
                history: limited
            });
            setMessages(prev => [...prev, { text: response.data.response, sender: 'bot' }]);
            const updatedHistory = [...limited, { text: response.data.response, sender: 'bot' }];
            setLimitedHistory(updatedHistory.length > MESSAGE_LIMIT ? updatedHistory.slice(updatedHistory.length - MESSAGE_LIMIT) : updatedHistory);
        } catch (error) {
            console.error('Error sending message:', error);
            setMessages(prev => [...prev, { text: 'Sorry, something went wrong. Please try again.', sender: 'bot' }]);
            const updatedHistory = [...limited, { text: 'Sorry, something went wrong. Please try again.', sender: 'bot' }];
            setLimitedHistory(updatedHistory.length > MESSAGE_LIMIT ? updatedHistory.slice(updatedHistory.length - MESSAGE_LIMIT) : updatedHistory);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-16rem)] w-full max-w-5xl mx-auto bg-[#0B1120] rounded-2xl overflow-hidden border-2 border-gray-700 shadow-2xl">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-10 space-y-8">
                {messages.length === 0 && (
                    <div className="text-center text-gray-400 mt-16">
                        <FaRobot className="mx-auto text-5xl mb-5 text-blue-500" />
                        <p className="text-2xl">Hi! I'm your AI assistant.</p>
                        <p className="text-base">How can I help you today?</p>
                    </div>
                )}
                
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`flex items-start space-x-5 ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
                    >
                        <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                            message.sender === 'user' ? 'bg-blue-500' : 'bg-gray-600'
                        }`}>
                            {message.sender === 'user' ? <FaUser className="text-xl text-white" /> : <FaRobot className="text-xl text-white" />}
                        </div>
                        <div className={`flex max-w-[95%] ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`rounded-3xl px-8 py-5 ${
                                message.sender === 'user' 
                                    ? 'bg-blue-500 text-white' 
                                    : 'bg-gray-800 text-gray-100'
                            }`}>
                                <p className="text-lg whitespace-pre-wrap">{message.text}</p>
                            </div>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-start space-x-5">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center">
                            <FaRobot className="text-xl text-white" />
                        </div>
                        <div className="bg-gray-800 rounded-3xl px-8 py-5">
                            <div className="flex space-x-3">
                                <div className="w-3 h-3 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-3 h-3 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-3 h-3 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-6 border-t-2 border-gray-700 bg-[#0B1120]">
                <div className="flex space-x-6">
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 bg-gray-800 text-white rounded-2xl px-8 py-5 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-2 border-gray-700"
                    />
                    <button
                        type="submit"
                        disabled={!inputMessage.trim() || isLoading}
                        className={`px-8 py-5 rounded-2xl flex items-center justify-center text-xl ${
                            !inputMessage.trim() || isLoading
                                ? 'bg-gray-700 cursor-not-allowed'
                                : 'bg-blue-500 hover:bg-blue-600'
                        } transition-colors duration-200`}
                    >
                        <FaPaperPlane className="text-white" />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatBot; 