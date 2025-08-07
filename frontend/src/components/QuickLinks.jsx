import React from "react";
import { FaHome, FaComments, FaRoute, FaRobot, FaArrowRight ,FaExternalLinkSquareAlt } from "react-icons/fa";
import { Link } from "react-router-dom";

function QuickLinks() {
  const links = [
    {
      to: "/",
      icon: FaHome,
      title: "Home",
      description: "Return to main feed",
      gradient: "from-blue-500/20 to-blue-600/20",
      hoverGradient: "from-blue-500/30 to-blue-600/30"
    },
    {
      to: "/discussion",
      icon: FaComments,
      title: "Discussion Section",
      description: "Join community talks",
      gradient: "from-green-500/20 to-green-600/20",
      hoverGradient: "from-green-500/30 to-green-600/30"
    },
    {
      to: "/roadmap",
      icon: FaRoute,
      title: "Road Map Generator",
      description: "Plan your learning path",
      gradient: "from-purple-500/20 to-purple-600/20",
      hoverGradient: "from-purple-500/30 to-purple-600/30"
    },
    {
      to: "/chatbot",
      icon: FaRobot,
      title: "AI Chat Assistant",
      description: "Get instant help",
      gradient: "from-orange-500/20 to-orange-600/20",
      hoverGradient: "from-orange-500/30 to-orange-600/30"
    }
  ];

  return (
    <div className="glassmorphism rounded-2xl overflow-hidden max-w-md mx-auto shadow-card border border-[rgba(255,255,255,0.08)] bg-gradient-to-br from-secondary/5 to-secondary/20">
      {/* Header Section */}
      <div className="relative p-6 bg-gradient-to-br from-accent/10 via-accent/5 to-transparent border-b border-[rgba(255,255,255,0.05)]">
        <div className="flex flex-col  justify-center items-center">
          <div className="flex items-center justify-center gap-1">
            <h3 className="text-2xl font-bold gradient-text mb-1">Quick Links</h3>
            <FaExternalLinkSquareAlt className="text-xl text-blue-400" />

            </div>
            <div>
            <p className="text-text-muted text-sm font-medium">Navigate with ease</p>
          </div>
        
        </div>
        
        {/* Decorative line */}
        <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-accent to-transparent w-full"></div>
      </div>

      {/* Links Section */}
      <div className="p-6">
        <ul className="space-y-3">
          {links.map((link, index) => (
            <li key={link.to}>
              <Link to={link.to} className="group block">
                <div className={`relative overflow-hidden rounded-xl p-4 transition-all duration-300 bg-gradient-to-r ${link.gradient} hover:${link.hoverGradient} border border-[rgba(255,255,255,0.05)] backdrop-blur-sm hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(79,70,229,0.15)] active:scale-[0.98]`}>
                  {/* Background pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute -top-4 -right-4 w-16 h-16 bg-accent rounded-full"></div>
                  </div>

                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Icon Container */}
                      <div className="flex-shrink-0 w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center group-hover:bg-accent/30 transition-colors group-hover:rotate-[10deg] group-hover:scale-110 transition-transform">
                        <link.icon className="text-accent text-xl group-hover:text-white transition-colors" />
                      </div>

                      {/* Text Content */}
                      <div className="flex-1">
                        <h4 className="text-text-secondary font-bold text-base group-hover:text-white transition-colors mb-1">
                          {link.title}
                        </h4>
                        <p className="text-text-muted text-xs font-medium group-hover:text-gray-200 transition-colors">
                          {link.description}
                        </p>
                      </div>
                    </div>

                    {/* Arrow Icon */}
                    <div className="flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity animate-pulse">
                      <FaArrowRight className="text-accent group-hover:text-white text-sm transition-colors" />
                    </div>
                  </div>

                  {/* Hover Effect Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 opacity-0 group-hover:opacity-100 animate-pulse"></div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>

 
      
    </div>
  );
}

export default QuickLinks;