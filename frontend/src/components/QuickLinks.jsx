import React from "react";
import { FaHome, FaBookOpen, FaComments, FaRoute, FaRobot } from "react-icons/fa";
import { Link } from "react-router-dom";

function QuickLinks() {
  return (
    <div className="bg-secondary rounded-lg shadow-md mt-6 overflow-hidden">
      <div className="bg-gradient-to-r from-accent to-accent-light p-4">
        <h3 className="text-white text-lg font-semibold">Quick Links 🚀</h3>
      </div>
      
      <ul className="p-4 space-y-3">
        
        <li>
          <Link 
            to="/discussion" 
            className="flex items-center p-3 rounded-lg transition-all duration-300 hover:bg-card group"
          >
            <FaComments className="text-accent mr-3 text-lg group-hover:text-secondary-accent transition-colors" />
            <span className="text-text-secondary group-hover:text-white transition-colors">Discussion Section</span>
          </Link>
        </li>
        
        <li>
          <Link 
            to="/" 
            className="flex items-center p-3 rounded-lg transition-all duration-300 hover:bg-card group"
          >
            <FaHome className="text-accent mr-3 text-lg group-hover:text-secondary-accent transition-colors" />
            <span className="text-text-secondary group-hover:text-white transition-colors">Home</span>
          </Link>
        </li>
        
        <li>
          <Link 
            to="/roadmap" 
            className="flex items-center p-3 rounded-lg transition-all duration-300 hover:bg-card group"
          >
            <FaRoute className="text-accent mr-3 text-lg group-hover:text-secondary-accent transition-colors" />
            <span className="text-text-secondary group-hover:text-white transition-colors">Road Map Generator</span>
          </Link>
        </li>

        <li>
          <Link 
            to="/chatbot" 
            className="flex items-center p-3 rounded-lg transition-all duration-300 hover:bg-card group"
          >
            <FaRobot className="text-accent mr-3 text-lg group-hover:text-secondary-accent transition-colors" />
            <span className="text-text-secondary group-hover:text-white transition-colors">AI Chat Assistant</span>
          </Link>
        </li>
      </ul>
    </div>
  );
}

export default QuickLinks;
