import React, { useState, useEffect, useRef } from "react";
import { FaGithub, FaHome, FaSignOutAlt, FaBell, FaTrophy, FaUser, FaCog, FaBars, FaTimes } from "react-icons/fa";
import { IoCaretDown, IoSearchOutline } from "react-icons/io5";
import logo from "../assets/logo.jpg";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../utils/autcontext";
import api from "../services/api.js";

function Header() {
  const [username, setUsername] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [people, setPeople] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const debounceTimeoutRef = useRef();

  useEffect(() => {
    if (user) setUsername(user.username);
  }, [user]);

  const handlelogout = async () => {
    try {
      let res = await logout();
      if (res) {
        console.log("navigating");
        navigate("/");
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const fetchPeople = async (searchTerm = "") => {
    if (!searchTerm) {
      setPeople([]);
      setShowResults(false);
      return;
    }
    try {
      const params = { search: searchTerm };
      const response = await api.get('/user/profilesearch', { params });
      setPeople(response.data.data.users || []);
      setShowResults(true);
    } catch (error) {
      setPeople([]);
      setShowResults(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    console.log(value);
    setSearch(value);
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(() => {
      fetchPeople(value);
    }, 300);
  };

  return (
    <>
      <header className="bg-secondary/95 backdrop-blur-md text-text-primary py-4 px-4 md:px-8 flex flex-col md:flex-row justify-between items-center w-full shadow-lg sticky top-0 z-50 border-b-2 border-card-border">
        <div className="flex items-center space-x-4 w-full md:w-auto justify-between">
          <a href="/" className="flex items-center group">
            <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-accent shadow-md group-hover:shadow-accent/30 transition-shadow duration-300">
              <img src={logo} alt="Logo" className="h-full w-full object-cover" />
            </div>
            <div className="ml-4 hidden sm:block">
              <h1 className="font-poppins text-2xl tracking-tight">
                <span className="gradient-text font-bold">Campus</span>
                <span className="text-primary px-2 py-1 ml-1 rounded shadow-sm font-bold text-xl bg-accent/10">
                  Connect
                </span>
              </h1>
            </div>
          </a>
          <button className="md:hidden ml-auto text-2xl p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        <div className="hidden md:flex flex-1 items-center justify-between w-full">
          <div className="flex-1 max-w-2xl mx-auto relative px-8">
            <div className="relative flex items-center group">
              <IoSearchOutline className="absolute left-4 text-text-muted text-xl group-focus-within:text-accent transition-colors" />
              <input
                type="text"
                placeholder="Search for people..."
                className="w-full pl-12 pr-6 py-3 bg-input border-2 border-card-border rounded-full focus:bg-input/80 focus:border-accent/50 focus:outline-none transition-all duration-300 text-base placeholder:text-text-muted/70"
                value={search}
                onChange={handleSearchChange}
                onFocus={() => people.length > 0 && setShowResults(true)}
                onBlur={() => setTimeout(() => setShowResults(false), 200)}
              />
              {showResults && people.length > 0 && (
                <div className="absolute left-0 right-0 top-12 bg-[#151f2a] z-50 rounded-xl shadow-2xl mt-2 max-h-72 overflow-y-auto border border-card-border p-2">
                  {people.map(person => (
                    <div
                      key={person._id}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent/30 cursor-pointer transition-colors duration-150 mb-1 last:mb-0"
                      onClick={() => { 
                        setShowResults(false); 
                        setSearch("");
                        console.log(person._id)
                         navigate(`/profile/${person._id}`); 
                        }}
                    >
                      <img
                        src={person.profileimage || `https://ui-avatars.com/api/?name=${person.username}`}
                        className="w-10 h-10 rounded-full border-2 border-accent/60 shadow-sm object-cover"
                        alt={person.username}
                      />
                      <div className="flex flex-col">
                        <span className="text-text-primary font-semibold leading-tight">{person.username}</span>
                        {person.name && (
                          <span className="text-text-secondary text-xs leading-tight">{person.name}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <a href="/" className="group">
              <button className="flex items-center space-x-2 bg-gradient-to-r from-accent to-accent-light text-white rounded-full px-6 py-3 shadow-md hover:shadow-lg hover:shadow-accent/20 transition-all duration-300 transform hover:-translate-y-0.5">
                <FaHome className="text-lg" />
                <span className="font-semibold text-base">Home</span>
              </button>
            </a>
            <a href="/leaderboard" className="group">
              <button className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-400 text-white rounded-full px-6 py-3 shadow-md hover:shadow-lg hover:shadow-amber-400/20 transition-all duration-300 transform hover:-translate-y-0.5">
                <FaTrophy className="text-lg" />
                <span className="font-semibold text-base">Leaderboard</span>
              </button>
            </a>
            <div className="relative">
              <button
                className="flex items-center space-x-3 bg-input rounded-full py-2 pl-2 pr-5 border-2 border-card-border hover:border-accent/50 transition-all duration-300 group"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <img
                  src={`https://ui-avatars.com/api/?name=${user?.username || 'User'}&background=4F7BFF&color=fff&bold=true`}
                  alt="Profile"
                  className="w-10 h-10 rounded-full border-2 border-accent/50"
                />
                <span className="font-semibold text-base text-text-primary">{username || 'User'}</span>
                <IoCaretDown className={`text-text-secondary text-base transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-card rounded-xl shadow-2xl overflow-hidden z-50 border-2 border-card-border">
                  <div className="p-4 border-b border-card-border bg-gradient-to-r from-accent/10 to-accent-light/10">
                    <p className="text-sm text-text-muted">Signed in as</p>
                    <p className="text-text-primary font-bold text-lg mt-1">{username || 'User'}</p>
                  </div>
                  <div className="py-2">
                    <a href="/profile" className="flex items-center gap-3 px-5 py-3 text-text-secondary hover:text-text-primary hover:bg-input/70 transition-all duration-200 group">
                      <FaUser className="h-5 w-5 group-hover:text-accent" />
                      <span className="text-base font-medium">My Profile</span>
                    </a>
                    <a href="/leaderboard" className="flex items-center gap-3 px-5 py-3 text-text-secondary hover:text-text-primary hover:bg-input/70 transition-all duration-200 group">
                      <FaTrophy className="h-5 w-5 text-amber-500" />
                      <span className="text-base font-medium">Leaderboard</span>
                    </a>
                    <a href="/settings" className="flex items-center gap-3 px-5 py-3 text-text-secondary hover:text-text-primary hover:bg-input/70 transition-all duration-200 group">
                      <FaCog className="h-5 w-5 group-hover:text-accent" />
                      <span className="text-base font-medium">Settings</span>
                    </a>
                  </div>
                  <div className="border-t border-card-border">
                    <button className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-red-500/10 transition-all duration-200 group" onClick={handlelogout}>
                      <FaSignOutAlt className="h-5 w-5 text-danger" />
                      <span className="text-danger font-semibold text-base">Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu without animation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex flex-col md:hidden">
          <div className="w-full max-w-sm mx-auto mt-8 bg-secondary rounded-2xl shadow-2xl flex flex-col gap-6 p-0 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-card-border bg-secondary">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-accent shadow-md">
                  <img src={logo} alt="Logo" className="h-full w-full object-cover" />
                </div>
                <span className="font-bold text-lg text-primary">Campus Connect</span>
              </div>
              <button className="text-2xl p-2 text-text-muted hover:text-accent transition-colors" onClick={() => setMobileMenuOpen(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-6">
              <div className="relative flex items-center group">
                <IoSearchOutline className="absolute left-4 text-text-muted text-xl group-focus-within:text-accent transition-colors" />
                <input
                type="text"
                placeholder="Search for people..."
                className="w-full pl-12 pr-6 py-3 bg-input border-2 border-card-border rounded-full focus:bg-input/80 focus:border-accent/50 focus:outline-none transition-all duration-300 text-base placeholder:text-text-muted/70"
                value={search}
                onChange={handleSearchChange}
                onFocus={() => people.length > 0 && setShowResults(true)}
                onBlur={() => setTimeout(() => setShowResults(false), 200)}
              />
                 {showResults && people.length > 0 && (
                <div className="absolute left-0 right-0 top-12 bg-[#151f2a] z-50 rounded-xl shadow-2xl mt-2 max-h-72 overflow-y-auto border border-card-border p-2">
                  {people.map(person => (
                    <div
                      key={person._id}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent/30 cursor-pointer transition-colors duration-150 mb-1 last:mb-0"
                      onClick={() => { 
                        setShowResults(false); 
                        setSearch("");
                        console.log(person._id)
                         navigate(`/profile/${person._id}`); 
                        }}
                    >
                      <img
                        src={person.profileimage || `https://ui-avatars.com/api/?name=${person.username}`}
                        className="w-10 h-10 rounded-full border-2 border-accent/60 shadow-sm object-cover"
                        alt={person.username}
                      />
                      <div className="flex flex-col">
                        <span className="text-text-primary font-semibold leading-tight">{person.username}</span>
                        {person.name && (
                          <span className="text-text-secondary text-xs leading-tight">{person.name}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              </div>
              <a href="/" className="group">
                <button className="flex items-center space-x-2 bg-gradient-to-r from-accent to-accent-light text-white rounded-full px-6 py-3 shadow-md hover:shadow-lg hover:shadow-accent/20 transition-all duration-300">
                  <FaHome className="text-lg" />
                  <span className="font-semibold text-base">Home</span>
                </button>
              </a>
              <a href="/leaderboard" className="group">
                <button className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-400 text-white rounded-full px-6 py-3 shadow-md hover:shadow-lg hover:shadow-amber-400/20 transition-all duration-300">
                  <FaTrophy className="text-lg" />
                  <span className="font-semibold text-base">Leaderboard</span>
                </button>
              </a>
              <div className="flex items-center space-x-3 bg-input rounded-full py-2 pl-2 pr-5 border-2 border-card-border">
                <img src={`https://ui-avatars.com/api/?name=${user?.username || 'User'}&background=4F7BFF&color=fff&bold=true`} alt="Profile" className="w-10 h-10 rounded-full border-2 border-accent/50" />
                <span className="font-semibold text-base text-text-primary">{username || 'User'}</span>
              </div>
              <button className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-red-500/10 transition-all duration-200 group border-t border-card-border" onClick={handlelogout}>
                <FaSignOutAlt className="h-5 w-5 text-danger" />
                <span className="text-danger font-semibold text-base">Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;
