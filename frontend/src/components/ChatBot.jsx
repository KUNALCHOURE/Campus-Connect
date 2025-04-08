import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { FaPaperPlane, FaRobot, FaUser } from 'react-icons/fa';
import api from '../services/api';
const ChatBot = () => {
    const [messages, setMessages] = useState([]);
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
        setIsLoading(true);

        try {
            const response = await api.post('/chat/chat', {
                message: userMessage
            });

            setMessages(prev => [...prev, { text: response.data.response, sender: 'bot' }]);
        } catch (error) {
            console.error('Error sending message:', error);
            setMessages(prev => [...prev, { text: 'Sorry, something went wrong. Please try again.', sender: 'bot' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-16rem)] bg-[#0B1120] rounded-xl overflow-hidden border border-gray-700">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.length === 0 && (
                    <div className="text-center text-gray-400 mt-8">
                        <FaRobot className="mx-auto text-4xl mb-3 text-blue-500" />
                        <p className="text-lg">Hi! I'm your AI assistant.</p>
                        <p className="text-sm">How can I help you today?</p>
                    </div>
                )}
                
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`flex items-start space-x-3 ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
                    >
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                            message.sender === 'user' ? 'bg-blue-500' : 'bg-gray-600'
                        }`}>
                            {message.sender === 'user' ? <FaUser className="text-sm text-white" /> : <FaRobot className="text-sm text-white" />}
                        </div>
                        <div className={`flex max-w-[80%] ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`rounded-2xl px-4 py-3 ${
                                message.sender === 'user' 
                                    ? 'bg-blue-500 text-white' 
                                    : 'bg-gray-800 text-gray-100'
                            }`}>
                                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                            </div>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                            <FaRobot className="text-sm text-white" />
                        </div>
                        <div className="bg-gray-800 rounded-2xl px-4 py-3">
                            <div className="flex space-x-2">
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700 bg-[#0B1120]">
                <div className="flex space-x-4">
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 bg-gray-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700"
                    />
                    <button
                        type="submit"
                        disabled={!inputMessage.trim() || isLoading}
                        className={`px-6 py-3 rounded-xl flex items-center justify-center ${
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