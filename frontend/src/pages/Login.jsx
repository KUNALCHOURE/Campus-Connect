import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authservice";
import Loading from "../components/Loading"; // Import the Loading component
import { useAuth } from "../utils/autcontext";
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

function Login() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
setIsLoading(true);
    try {
      await login(formData);
      toast.success("Login successful!");
      navigate('/home');
  } catch (error) {
      toast.error("Invalid credentials. Please try again.");
  } finally {
      setIsLoading(false);
  }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    navigate("/register");
  };

  return (
    <>
      <SimpleHeader />
      {isLoading ? (
        <Loading /> // Show loading screen when isLoading is true
      ) : (
        <div className="flex items-center justify-center min-h-screen bg-primary pt-16">
          <div className="bg-secondary p-8 rounded-lg shadow-lg w-96">
            <h1 className="text-2xl font-semibold text-accent text-center mb-6">Login</h1>
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-primary-color mb-2">Username</label>
                <input
                  type="text"
                  name="username"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full p-3 text-primary-color bg-primary-light rounded focus:outline-none focus:ring focus:ring-accent"
                  disabled={isLoading} // Disable input during loading
                />
              </div>
              <div>
                <label className="block text-primary-color mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full p-3 text-primary-color bg-primary-light rounded focus:outline-none focus:ring focus:ring-accent"
                  disabled={isLoading} // Disable input during loading
                />
              </div>
              <button
                type="submit"
                className="w-full bg-accent hover:bg-accent-dark text-white font-semibold py-3 rounded focus:outline-none"
                disabled={isLoading} // Disable button during loading
              >
                {isLoading ? "Logging in..." : "Login"}
              </button>
            </form>
            <p className="mt-4 text-center text-primary-color">
              Don't have an account?{" "}
              <span onClick={handleRegister} className="text-accent hover:underline cursor-pointer">
                Register
              </span>
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export default Login;
