import { Link } from "react-router-dom";
import { useAuth } from "../utils/autcontext";

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-primary text-primary-color">
      {/* Header */}
      <nav className="w-full flex justify-between items-center py-4 px-8 bg-secondary shadow-lg">
        <h1 className="text-2xl font-bold text-accent">
          Campus <span className="bg-accent text-white px-2 rounded">Connect</span>
        </h1>
        <div>
          {user ? (
            <Link to="/home" className="bg-accent px-4 py-2 rounded-lg text-white hover:bg-accent-dark">
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="bg-accent px-4 py-2 rounded-lg text-white hover:bg-accent-dark mr-4">
                Login
              </Link>
              <Link to="/register" className="border border-accent px-4 py-2 rounded-lg text-accent hover:bg-accent hover:text-white">
                Register
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Main Section */}
      <div className="flex flex-col md:flex-row px-4 py-12 items-center text-center md:text-left">
        <div className="w-full md:w-1/2 p-6">
          <h2 className="text-4xl font-bold mb-4">Welcome to College HUB</h2>
          <p className="text-lg text-secondary-text max-w-lg">
            Connect with peers, share updates, ask questions, and stay updated with the latest trends in your college community.
          </p>
          {!user && (
            <div className="mt-6">
              <Link to="/register" className="bg-accent px-6 py-3 text-lg rounded-lg text-white hover:bg-accent-dark">
                Get Started
              </Link>
            </div>
          )}
        </div>
        <div className="w-full md:w-1/2 p-6 flex justify-center">
          <img src="/images/landing-illustration.png" alt="Community" className="w-3/4 md:w-full" />
        </div>
      </div>

      {/* Feature Section */}
      <section className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto text-center">
        <div className="bg-secondary p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-2 text-accent">Community</h3>
          <p className="text-secondary-text">Engage with students and discuss academic & career topics.</p>
        </div>
        <div className="bg-secondary p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-2 text-accent">Trending Topics</h3>
          <p className="text-secondary-text">Stay updated with the latest trends in technology, interviews, and projects.</p>
        </div>
        <div className="bg-secondary p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-2 text-accent">Ask Questions</h3>
          <p className="text-secondary-text">Get answers from experienced students and mentors.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-16 py-4 text-secondary-text text-sm border-t border-secondary w-full text-center">
        © 2025 Campus Connect. All rights reserved.
      </footer>
    </div>
  );
}