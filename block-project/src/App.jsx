import { useState, useEffect, useMemo } from "react";

const CATEGORIES = ["Documentation", "Academic", "Errands", "Other"];
const CAMPUS_SPOTS = ["Mess", "Residency", "Library", "Canteen", "Sports Complex", "Main Gate"];

// Custom hook for LocalStorage persistence
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : initialValue;
    } catch (err) {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error("Storage error", err);
    }
  }, [key, value]);

  return [value, setValue];
}

const generateId = () => Math.random().toString(36).substring(2, 9);

function formatTime(isoString) {
  if (!isoString) return "—";
  return new Date(isoString).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function checkIsLate(deadline) {
  return deadline && new Date() > new Date(deadline);
}

// --- UI Components ---

function Toast({ message }) {
  if (!message) return null;
  const isError = message.type === "error";
  return (
    <div style={{
      position: "fixed", bottom: 30, left: "50%", transform: "translateX(-50%)",
      background: isError ? "#e11d48" : "#334155", color: "white",
      padding: "12px 24px", borderRadius: "8px", fontSize: "14px", zIndex: 1000
    }}>
      {message.text}
    </div>
  );
}

function TaskCard({ task, currentUser, onAccept, onDecline }) {
  const isOwner = task.postedBy === currentUser?.name;
  
  return (
    <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "16px", marginBottom: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
        <div>
          <span style={{ fontSize: "11px", fontWeight: "bold", color: "#0d9488", textTransform: "uppercase" }}>{task.category}</span>
          <h3 style={{ fontSize: "16px", margin: "4px 0" }}>{task.title}</h3>
          <div style={{ fontSize: "12px", color: "#64748b" }}>
            {task.locType === "Remote" ? "🌐 Remote" : `📍 ${task.location}`}
          </div>
        </div>
        <div style={{ fontSize: "18px", fontWeight: "bold", color: "#0f172a" }}>₹{task.reward}</div>
      </div>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: "12px", color: "#94a3b8" }}>Ends: {formatTime(task.deadline)}</div>
        {!isOwner ? (
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={() => onDecline(task.id)} style={{ padding: "6px 10px", border: "1px solid #cbd5e1", borderRadius: "6px", cursor: "pointer" }}>Hide</button>
            <button onClick={() => onAccept(task.id)} style={{ padding: "6px 12px", background: "#0d9488", color: "white", border: "none", borderRadius: "6px", fontWeight: "600", cursor: "pointer" }}>Accept</button>
          </div>
        ) : (
          <span style={{ fontSize: "12px", color: "#94a3b8", fontStyle: "italic" }}>My Post</span>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState("onboarding");
  const [tasks, setTasks] = useLocalStorage("blok_tasks_v2", []);
  const [profile, setProfile] = useLocalStorage("blok_profile_v2", null);
  const [hiddenTaskIds, setHiddenTaskIds] = useState([]);
  
  // Forms
  const [userForm, setUserForm] = useState({ name: "", agreePrivacy: false, agreePenalty: false });
  const [taskForm, setTaskForm] = useState({ title: "", cat: "Academic", dl: "", reward: "", locType: "Remote", spot: "Mess", customLoc: "", gs: false });
  
  // UI State
  const [filterType, setFilterType] = useState("All");
  const [isSortedByPrice, setIsSortedByPrice] = useState(false);
  const [completionModal, setCompletionModal] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (profile && activeTab === "onboarding") setActiveTab("on_it");
  }, [profile]);

  const triggerToast = (text, type = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreateProfile = () => {
    if (!userForm.name.trim()) return triggerToast("Name is required", "error");
    if (!userForm.agreePrivacy || !userForm.agreePenalty) return triggerToast("Accept terms first", "error");
    
    setProfile({ name: userForm.name.trim(), trustScore: 80, joinedAt: new Date().toISOString() });
    setActiveTab("on_it");
  };

  const handlePostTask = () => {
    const { title, reward, dl, locType, spot, customLoc } = taskForm;
    if (!title || !reward || !dl) return triggerToast("Missing information", "error");

    const finalLocation = locType === "Remote" ? "Remote" : (spot === "Other" ? customLoc : spot);
    
    const newTask = {
      id: generateId(),
      title: title.trim(),
      category: taskForm.cat,
      deadline: dl,
      reward: parseFloat(reward),
      locType: locType,
      location: finalLocation,
      genderSensitive: taskForm.gs,
      postedBy: profile.name,
      assignedTo: null,
      status: "Available",
      postedAt: new Date().toISOString()
    };

    setTasks(prev => [newTask, ...prev]);
    setTaskForm({ title: "", cat: "Academic", dl: "", reward: "", locType: "Remote", spot: "Mess", customLoc: "", gs: false });
    triggerToast("Task posted successfully!");
    setActiveTab("on_it");
  };

  const acceptTask = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: "In Progress", assignedTo: profile.name } : t));
    triggerToast("Task accepted!");
  };

  const finalizeTask = (task) => {
    const isLate = checkIsLate(task.deadline);
    const finalEarnings = isLate ? task.reward * 0.5 : task.reward;
    
    setTasks(prev => prev.map(t => t.id === task.id ? { 
      ...t, 
      status: "Done", 
      completedAt: new Date().toISOString(), 
      earned: finalEarnings,
      late: isLate 
    } : t));

    setProfile(prev => ({
      ...prev,
      trustScore: Math.min(100, prev.trustScore + (isLate ? -5 : 5))
    }));

    setCompletionModal(null);
    triggerToast(isLate ? "Late completion: 50% penalty" : "Task completed!", isLate ? "error" : "success");
  };

  const filteredTasks = useMemo(() => {
    let list = tasks.filter(t => t.status === "Available" && !hiddenTaskIds.includes(t.id));
    if (filterType !== "All") list = list.filter(t => t.locType === filterType);
    if (isSortedByPrice) list = [...list].sort((a, b) => b.reward - a.reward);
    return list;
  }, [tasks, filterType, isSortedByPrice, hiddenTaskIds]);

  // Main Layout
  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif", background: "#f1f5f9", minHeight: "100vh", color: "#1e293b" }}>
      
      {/* Navbar */}
      {profile && (
        <header style={{ background: "white", borderBottom: "1px solid #e2e8f0", position: "sticky", top: 0, zIndex: 10 }}>
          <div style={{ maxWidth: "500px", margin: "0 auto", padding: "12px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h1 style={{ color: "#0d9488", margin: 0, fontSize: "20px" }}>Blok.</h1>
              <div style={{ fontSize: "14px", fontWeight: "bold" }}>⭐ {profile.trustScore}</div>
            </div>
            <nav style={{ display: "flex", marginTop: "12px", gap: "20px" }}>
              {["need_it", "on_it", "profile"].map(tab => (
                <button 
                  key={tab} 
                  onClick={() => setActiveTab(tab)}
                  style={{
                    flex: 1, padding: "8px", border: "none", background: "none", cursor: "pointer",
                    borderBottom: activeTab === tab ? "2px solid #0d9488" : "2px solid transparent",
                    color: activeTab === tab ? "#0d9488" : "#64748b", fontWeight: "600"
                  }}
                >
                  {tab.replace("_", " ").toUpperCase()}
                </button>
              ))}
            </nav>
          </div>
        </header>
      )}

      <main style={{ maxWidth: "500px", margin: "0 auto", padding: "20px 16px" }}>
        
        {/* Step 1: Onboarding */}
        {activeTab === "onboarding" && (
          <div style={{ background: "white", padding: "24px", borderRadius: "12px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
            <h2 style={{ marginTop: 0 }}>Campus Marketplace</h2>
            <p style={{ color: "#64748b" }}>Enter your name to start trading tasks.</p>
            <input 
              style={{ width: "100%", padding: "10px", margin: "10px 0", boxSizing: "border-box" }} 
              placeholder="Your Name"
              value={userForm.name}
              onChange={e => setUserForm({...userForm, name: e.target.value})}
            />
            <div style={{ fontSize: "13px", marginTop: "10px" }}>
              <label style={{ display: "block", marginBottom: "8px" }}>
                <input type="checkbox" onChange={e => setUserForm({...userForm, agreePrivacy: e.target.checked})} /> I agree to keep data within campus.
              </label>
              <label style={{ display: "block" }}>
                <input type="checkbox" onChange={e => setUserForm({...userForm, agreePenalty: e.target.checked})} /> I understand the 50% late penalty.
              </label>
            </div>
            <button 
              onClick={handleCreateProfile}
              style={{ width: "100%", padding: "12px", background: "#0d9488", color: "white", border: "none", borderRadius: "6px", marginTop: "20px", fontWeight: "bold" }}
            >
              Get Started
            </button>
          </div>
        )}

        {/* Step 2: Post Task */}
        {activeTab === "need_it" && (
          <div style={{ background: "white", padding: "20px", borderRadius: "12px" }}>
            <h3 style={{ marginTop: 0 }}>Create New Task</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <input placeholder="What do you need help with?" style={{ padding: "10px" }} value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} />
              <select style={{ padding: "10px" }} value={taskForm.cat} onChange={e => setTaskForm({...taskForm, cat: e.target.value})}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <div style={{ display: "flex", gap: "10px" }}>
                <input type="datetime-local" style={{ flex: 1, padding: "10px" }} value={taskForm.dl} onChange={e => setTaskForm({...taskForm, dl: e.target.value})} />
                <input type="number" placeholder="Reward ₹" style={{ width: "100px", padding: "10px" }} value={taskForm.reward} onChange={e => setTaskForm({...taskForm, reward: e.target.value})} />
              </div>
              <button onClick={handlePostTask} style={{ background: "#0d9488", color: "white", padding: "12px", border: "none", borderRadius: "6px", fontWeight: "bold" }}>Post Task</button>
            </div>
          </div>
        )}

        {/* Step 3: Browse Tasks */}
        {activeTab === "on_it" && (
          <div>
            <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
              {["All", "Remote", "On-Site"].map(f => (
                <button key={f} onClick={() => setFilterType(f)} style={{ padding: "6px 12px", borderRadius: "20px", border: "1px solid #cbd5e1", background: filterType === f ? "#0d9488" : "white", color: filterType === f ? "white" : "#64748b" }}>{f}</button>
              ))}
            </div>
            {filteredTasks.map(t => (
              <TaskCard key={t.id} task={t} currentUser={profile} onAccept={acceptTask} onDecline={(id) => setHiddenTaskIds([...hiddenTaskIds, id])} />
            ))}
          </div>
        )}

        {/* Step 4: Profile & Progress */}
        {activeTab === "profile" && (
          <div>
            <div style={{ background: "white", padding: "20px", borderRadius: "12px", marginBottom: "20px" }}>
              <h2 style={{ margin: 0 }}>{profile.name}</h2>
              <p style={{ color: "#64748b", margin: "5px 0" }}>Campus Trust Score: {profile.trustScore}/100</p>
            </div>

            <h4 style={{ color: "#475569" }}>Active Tasks</h4>
            {tasks.filter(t => t.assignedTo === profile.name && t.status === "In Progress").map(t => (
              <div key={t.id} style={{ background: "white", padding: "15px", borderRadius: "10px", borderLeft: "4px solid #0d9488", marginBottom: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>{t.title}</span>
                  <button onClick={() => setCompletionModal(t)} style={{ background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "4px", padding: "4px 8px" }}>Finish</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Completion Modal */}
      {completionModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ background: "white", padding: "20px", borderRadius: "12px", width: "100%", maxWidth: "400px" }}>
            <h3>Confirm Completion</h3>
            <p>Did you finish "{completionModal.title}"?</p>
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button onClick={() => setCompletionModal(null)} style={{ flex: 1, padding: "10px" }}>Cancel</button>
              <button onClick={() => finalizeTask(completionModal)} style={{ flex: 1, padding: "10px", background: "#0d9488", color: "white", border: "none" }}>Yes, Done</button>
            </div>
          </div>
        </div>
      )}

      <Toast message={toast} />
    </div>
  );
}