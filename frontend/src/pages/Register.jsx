import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authservice";
import { Link } from "react-router-dom";
import { useAuth } from "../utils/autcontext";

function SimpleHeader() {
  return (
    <header className="text-primary-color p-4 flex justify-between items-center bg-secondary shadow-md fixed top-0 left-0 w-full z-10">
     <Link to={'/'}>
      <div className="flex items-center space-x-4">
        <img src="/logo.jpg" alt="Logo" className="h-10 rounded-full" />
        <h1 className="text-2xl font-bold text-accent">
          Campus <span className="text-white">Connect</span>
        </h1>
      </div>
      </Link>
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
  let { setUser } = useAuth();
  const [email, setEmailId] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    education: {
      college: "",
      degree: "",
      branch: "",
      year: "",
      cgpa: ""
    },
    bio: ""
  });
  const navigate = useNavigate();

  const handleTopicChange = (topic) => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(selectedTopics.filter(t => t !== topic));
    } else if (selectedTopics.length < 3) {
      setSelectedTopics([...selectedTopics, topic]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    console.log(username, password, email, selectedTopics, formData);
    
    if (!username || !password) {
        setError("Both fields are required.");
        return;
    }

    try {
        const response = await authService.register({ 
            email, 
            username, 
            password, 
            preferences: selectedTopics,
            education: formData.education,
            bio: formData.bio
        });

        console.log("Register API Response:", response.data);

        if (response.data.user) {
            setUser(response.data.user);
            navigate("/home");
        } else {
            throw new Error("Invalid server response.");
        }

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
        <div className="bg-secondary p-8 rounded-lg shadow-lg w-[40rem]">
          <h1 className="text-2xl font-semibold text-accent text-center mb-6">
            Register
          </h1>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
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
              className="w-full p-3 mb-4 text-primary-color bg-primary-light rounded focus:outline-none focus:ring focus:ring-accent"
            />

            <div className="space-y-4">
              <h2 className="text-primary-color text-lg font-semibold">Education Details</h2>
              <input
                type="text"
                placeholder="College Name"
                name="education.college"
                value={formData.education.college}
                onChange={handleInputChange}
                className="w-full p-3 text-primary-color bg-primary-light rounded focus:outline-none focus:ring focus:ring-accent"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Degree"
                  name="education.degree"
                  value={formData.education.degree}
                  onChange={handleInputChange}
                  className="w-full p-3 text-primary-color bg-primary-light rounded focus:outline-none focus:ring focus:ring-accent"
                />
                <input
                  type="text"
                  placeholder="Branch"
                  name="education.branch"
                  value={formData.education.branch}
                  onChange={handleInputChange}
                  className="w-full p-3 text-primary-color bg-primary-light rounded focus:outline-none focus:ring focus:ring-accent"
                />
                <input
                  type="text"
                  placeholder="Year"
                  name="education.year"
                  value={formData.education.year}
                  onChange={handleInputChange}
                  className="w-full p-3 text-primary-color bg-primary-light rounded focus:outline-none focus:ring focus:ring-accent"
                />
                <input
                  type="text"
                  placeholder="CGPA"
                  name="education.cgpa"
                  value={formData.education.cgpa}
                  onChange={handleInputChange}
                  className="w-full p-3 text-primary-color bg-primary-light rounded focus:outline-none focus:ring focus:ring-accent"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-primary-color text-lg font-semibold">Bio</h2>
              <textarea
                placeholder="Tell us about yourself..."
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows="4"
                className="w-full p-3 text-primary-color bg-primary-light rounded focus:outline-none focus:ring focus:ring-accent resize-none"
              />
            </div>

            <div className="mb-4">
              <h2 className="text-primary-color mb-2 text-lg font-semibold">Select Topics (up to 3):</h2>
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