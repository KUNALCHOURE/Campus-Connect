import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import authService from "../services/authservice";

function SimpleHeader() {
  return (
    <header className="text-primary-color p-4 flex justify-between items-center bg-secondary shadow-md fixed top-0 left-0 w-full z-10">
      <div className="flex items-center space-x-4">
        <img src="/logo.jpg" alt="Logo" className="h-10 rounded-full" />
        <h1 className="text-2xl font-bold text-accent">
          Campus <span className="text-white">Connect</span>
        </h1>
      </div>
    </header>
  );
}

const topics = [
  "Networking", "WebDevelopment", "AppDevelopment", "SoftwareDevelopment",
  "CompetitiveProgramming", "Internship", "CorporateLife", "Blockchain",
  "Web3", "MachineLearning", "ArtificialIntelligence", "DataAnalytics",
  "CloudComputing", "Innovation", "OpenSource"
];

function Register() {
  const [email, setEmailId] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleTopicChange = (topic) => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(selectedTopics.filter(t => t !== topic));
    } else if (selectedTopics.length < 3) {
      setSelectedTopics([...selectedTopics, topic]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Both fields are required.");
      return;
    }

    try {
      await authService.register({ email, username, password, preferences: selectedTopics });
      navigate("/");

      // await axios.post("http://localhost:3000/api/v1/user/register", 
      //   { email, username, password, preferences: selectedTopics }, 
      //   { withCredentials: true }  // Required for cookies or JWT
      // );
      
    } catch (error) {
      setError(error.message || "Registration failed. Please try again.");
    }
  };

  const handleLoginClick = (e) => {
    e.preventDefault();
    navigate("/login");
  };

  return (
    <>
      <SimpleHeader />
      <div className="flex items-center justify-center min-h-screen bg-primary pt-16">
        <div className="bg-secondary p-8 rounded-lg shadow-lg w-[30rem]">
          <h1 className="text-2xl font-semibold text-accent text-center mb-6">
            Register
          </h1>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Email ID"
              value={email}
              onChange={(e) => setEmailId(e.target.value)}
              className="w-full p-3 mb-4 text-primary-color bg-primary-light rounded focus:outline-none focus:ring focus:ring-accent"
            />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 mb-4 text-primary-color bg-primary-light rounded focus:outline-none focus:ring focus:ring-accent"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 mb-6 text-primary-color bg-primary-light rounded focus:outline-none focus:ring focus:ring-accent"
            />
            <div className="mb-4">
              <h2 className="text-primary-color mb-2">Select Topics (up to 3):</h2>
              <div className="flex flex-row flex-wrap gap-2">
                {topics.map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    className={`p-2 text-sm rounded ${selectedTopics.includes(topic) ? 'bg-accent' : 'bg-primary-light'} text-white`}
                    onClick={() => handleTopicChange(topic)}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-accent hover:bg-accent-dark text-white font-semibold py-3 rounded focus:outline-none"
            >
              Submit
            </button>
          </form>
          <p className="mt-4 text-center text-primary-color">
            Have an Account? {" "}
            <span onClick={handleLoginClick} className="text-accent hover:underline cursor-pointer">
              Login
            </span>
          </p>
        </div>
      </div>
    </>
  );
}

export default Register;
