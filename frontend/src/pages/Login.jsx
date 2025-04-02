import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../utils/autcontext"; // Adjusted import path
import Loading from '../components/Loading.jsx'// Adjusted import path
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";

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

function Login() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let res=await login(formData);
      if(res){
        toast.success("Login successful!");
        navigate('/home');
      }
   
    } catch (error) {
      toast.error("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    navigate("/register");
  };

  return (
    <>
      <SimpleHeader />
      {loading ? (
        <Loading />
      ) : (
        <div className="flex items-center justify-center min-h-screen bg-primary pt-16">
          <div className="bg-secondary p-8 rounded-lg shadow-lg w-96">
            <h1 className="text-2xl font-semibold text-accent text-center mb-6">Login</h1>
            
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
                  disabled={loading}
                  required
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
                  disabled={loading}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-accent hover:bg-accent-dark text-white font-semibold py-3 rounded focus:outline-none"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
            <p className="mt-4 text-center text-primary-color">
              Don't have an account?{" "}
              <span 
                onClick={handleRegister} 
                className="text-accent hover:underline cursor-pointer"
              >
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