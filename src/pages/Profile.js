import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faPhone, faUniversity, faIdCard, faGraduationCap, faFileAlt, faLink, faProjectDiagram } from "@fortawesome/free-solid-svg-icons";

// Helper to get API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

function Profile() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!currentUser) {
      // Don't redirect immediately, just show state
      // But for better UX, we might want to redirect
      setTimeout(() => navigate("/login"), 100);
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        // If no userId param, use current user's id (my profile)
        const targetId = userId || currentUser.id;

        const response = await fetch(`${API_URL}/profile/${targetId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Failed to fetch profile");
        setUser(data.user);
      } catch (err) {
        console.error("Profile fetch error:", err);
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate, userId, currentUser]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg p-4 max-w-md text-center">
          <h3 className="font-bold mb-2">Error Loading Profile</h3>
          <p>{error}</p>
          <button onClick={() => navigate("/")} className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen pb-12">
      {/* Cover Image / Gradient */}
      <div className="h-48 md:h-64 bg-gradient-to-r from-primary-blue-dark to-purple-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <div className="flex flex-col md:flex-row gap-6">

          {/* Left Column: Profile Card & Contact */}
          <div className="w-full md:w-1/3 space-y-6">
            {/* Main Profile Card */}
            <div className="glass-card p-6 flex flex-col items-center text-center">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-background overflow-hidden bg-surface shadow-xl mb-4">
                <img
                  src={
                    user.profile_picture
                      ? `${API_URL}${user.profile_picture}`
                      : "https://via.placeholder.com/150"
                  }
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h1 className="text-2xl font-bold text-white mb-1">{user.name}</h1>
              <p className="text-text-secondary mb-4">{user.department} Student</p>

              <div className="w-full border-t border-white/5 pt-4 mt-2 space-y-3 text-sm text-left">
                <div className="flex items-center text-text-secondary">
                  <FontAwesomeIcon icon={faEnvelope} className="w-5 text-primary mr-3" />
                  <span className="truncate">{user.email}</span>
                </div>
                {user.phone_number && (
                  <div className="flex items-center text-text-secondary">
                    <FontAwesomeIcon icon={faPhone} className="w-5 text-primary mr-3" />
                    <span>{user.phone_number}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Academic Info */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-white mb-4 border-b border-white/5 pb-2">Academic Info</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <FontAwesomeIcon icon={faIdCard} className="w-5 text-accent mt-1 mr-3" />
                  <div>
                    <p className="text-xs text-text-secondary uppercase tracking-wider">Roll Number</p>
                    <p className="text-white">{user.roll_number}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <FontAwesomeIcon icon={faUniversity} className="w-5 text-accent mt-1 mr-3" />
                  <div>
                    <p className="text-xs text-text-secondary uppercase tracking-wider">Department</p>
                    <p className="text-white">{user.department}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <FontAwesomeIcon icon={faGraduationCap} className="w-5 text-accent mt-1 mr-3" />
                  <div>
                    <p className="text-xs text-text-secondary uppercase tracking-wider">Year of Study</p>
                    <p className="text-white">{user.year_of_study}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Documents */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-white mb-4 border-b border-white/5 pb-2">Documents</h3>
              {user.documents && user.documents.length > 0 ? (
                <ul className="space-y-3">
                  {user.documents.map((doc, index) => (
                    <li key={index}>
                      <a
                        href={`${API_URL}${doc.file}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
                      >
                        <FontAwesomeIcon icon={faFileAlt} className="text-text-secondary group-hover:text-primary transition-colors mr-3" />
                        <span className="text-sm text-text-primary truncate flex-1">{doc.name}</span>
                        <FontAwesomeIcon icon={faLink} className="text-xs text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-text-secondary text-sm italic">No documents uploaded.</p>
              )}
            </div>
          </div>

          {/* Right Column: Skills & Projects */}
          <div className="w-full md:w-2/3 space-y-6">

            {/* Skills */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold text-white mb-4">Skills & Expertise</h2>
              {user.skills && user.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {user.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium hover:bg-primary/20 transition-colors cursor-default"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-text-secondary italic">No skills listed yet.</p>
              )}
            </div>

            {/* Projects */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <FontAwesomeIcon icon={faProjectDiagram} className="mr-2 text-primary" />
                Projects
              </h2>
              {user.projects && user.projects.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {user.projects.map((project, index) => (
                    <div key={index} className="glass-card p-5 hover:border-primary/30 transition-all group">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg text-white group-hover:text-primary transition-colors">{project.project_name}</h3>
                        {project.type && (
                          <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded bg-white/5 text-text-secondary">
                            {project.type}
                          </span>
                        )}
                      </div>
                      <p className="text-text-secondary text-sm mb-4 line-clamp-3">
                        {project.project_description}
                      </p>
                      {project.link && (
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm text-primary hover:text-primary-blue-dark font-medium"
                        >
                          View Project <span className="ml-1">→</span>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="glass-card p-8 text-center">
                  <p className="text-text-secondary">No projects showcased yet.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;

