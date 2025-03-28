import React, { useState } from "react";
import Header from "../components/Header";
import PostList from "../components/PostList";
import ProfileCard from "../components/ProfileCard";
import QuickLinks from "../components/QuickLinks";
import TrendingSidebar from "../components/TrendingSidebar.jsx";

const HomePage = () => {
  const [selectedTab, setSelectedTab] = useState("all");

  return (
    <div className="min-h-screen bg-primary text-primary-color">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="flex flex-col md:flex-row px-4 py-6">
        {/* Left Sidebar */}
        <aside className="w-full md:w-1/4 p-4">
          <ProfileCard />
          <QuickLinks />
        </aside>

        <main className="w-full md:w-2/4 p-4">
          {/* PostList Component (includes PostInput) */}
          <PostList selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
        </main>

        {/* Right Sidebar */}
        <aside className="w-full md:w-1/4 p-4">
          {(() => {
            try {
              return <TrendingSidebar />;
            } catch (error) {
              console.error("TrendingSidebar error:", error);
              return <div className="bg-secondary rounded-lg p-4">Trending section unavailable</div>;
            }
          })()}
        </aside>
      </div>
    </div>
  );
};

export default HomePage;