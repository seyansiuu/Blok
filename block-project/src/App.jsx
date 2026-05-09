import { useState, useEffect, useMemo } from "react";

const CATEGORIES = ["Documentation", "Academic", "Errands", "Other"];
const CAMPUS_SPOTS = ["Mess", "Residency", "Library", "Canteen", "Sports Complex", "Main Gate"];

function useLS(key, init) {
  const [v, sv] = useState(() => { try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : init; } catch { return init; } });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(v)); } catch {} }, [key, v]);
  return [v, sv];
}

function genId() { return Math.random().toString(36).slice(2, 9); }

function fmtIST(iso) {
  if (!iso) return "—";
  try { return new Date(iso).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: true }); }
  catch { return iso; }
}

function isLate(dl) { return dl && new Date() > new Date(dl); }

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: toast.type === "error" ? "#dc2626" : "#1a1a1a", color: "#fff", padding: "10px 20px", borderRadius: 12, fontSize: 13, fontWeight: 500, zIndex: 200, maxWidth: 340, textAlign: "center" }}>
      {toast.msg}
    </div>
  );
}

function StatusBadge({ status }) {
  const m = { Available: ["#eff6ff", "#1d4ed8", "🔵"], "In Progress": ["#fffbeb", "#b45309", "🟡"], Done: ["#f0fdf4", "#166534", "🟢"] };
  const [bg, fg, dot] = m[status] || m.Available;
  return <span style={{ fontSize: 11, background: bg, color: fg, padding: "3px 10px", borderRadius: 20, fontWeight: 500 }}>{dot} {status}</span>;
}

function catStyle(cat) {
  const m = { Documentation: ["#eff6ff", "#1e40af"], Academic: ["#f5f3ff", "#5b21b6"], Errands: ["#fffbeb", "#92400e"], Other: ["#f9fafb", "#374151"] };
  const [bg, color] = m[cat] || m.Other;
  return { fontSize: 11, background: bg, color, padding: "2px 8px", borderRadius: 20, fontWeight: 500 };
}

// ... keep other imports and helper functions (useLS, genId, fmtIST, etc.) same

function TaskCard({ task, profile, onAccept, onDecline }) {
  return (
    <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e3dd", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
            <span style={catStyle(task.category)}>{task.category}</span>
            {task.genderSensitive && <span style={{ fontSize: 11, background: "#fdf2f8", color: "#9d174d", padding: "2px 8px", borderRadius: 20 }}>🌸 Gender-Sensitive</span>}
            {task.locType === "Remote"
              ? <span style={{ fontSize: 11, background: "#eff6ff", color: "#1d4ed8", padding: "2px 8px", borderRadius: 20 }}>🌐 Remote</span>
              : <span style={{ fontSize: 11, background: "#f0fdf4", color: "#166534", padding: "2px 8px", borderRadius: 20 }}>📍 {task.location}</span>}
          </div>
          <div style={{ fontWeight: 600, fontSize: 15, lineHeight: 1.3 }}>{task.title}</div>
        </div>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#6c47ff", flexShrink: 0 }}>₹{task.reward}</div>
      </div>
      
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 4 }}>
        <div style={{ fontSize: 12, color: "#888" }}>⏰ {fmtIST(task.deadline)} · by {task.postedBy}</div>
        
        {task.postedBy !== profile?.name ? (
          <div style={{ display: "flex", gap: 8 }}>
            <button 
              onClick={() => onDecline(task.id)} 
              style={{ padding: "8px 12px", borderRadius: 8, border: "1.5px solid #fee2e2", background: "#fef2f2", color: "#ef4444", fontWeight: 600, fontSize: 12, cursor: "pointer" }}
            >
              ✕
            </button>
            <button 
              onClick={() => onAccept(task.id)} 
              style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#10b981", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
            >
              Accept ✓
            </button>
          </div>
        ) : (
          <span style={{ fontSize: 11, color: "#aaa", fontStyle: "italic" }}>Your post</span>
        )}
      </div>
    </div>
  );
}

export default function App() {
  // ... other states
  const [declinedIds, setDeclinedIds] = useState([]); // Temporary state for hidden tasks

  // ... handleOnboard, handlePost

  function acceptTask(id) {
    setTasks(p => p.map(t => t.id === id ? { ...t, status: "In Progress", assignedTo: profile.name } : t));
    showToast("Task accepted! Check your profile.");
  }

  function declineTask(id) {
    setDeclinedIds(p => [...p, id]);
    showToast("Task hidden from your feed.", "error");
  }

  // Filter tasks to exclude those declined by the user
  const avail = useMemo(() => {
    let t = tasks.filter(t => t.status === "Available" && !declinedIds.includes(t.id));
    if (filter === "Remote") t = t.filter(t => t.locType === "Remote");
    if (filter === "On-Site") t = t.filter(t => t.locType === "On-Site");
    if (sortP) t = [...t].sort((a, b) => b.reward - a.reward); // Changed to b-a for Descending (higher price first)
    return t;
  }, [tasks, filter, sortP, declinedIds]);

  
}

const lbl = { display: "block", fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 6 };
const inp = { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #e5e3dd", fontSize: 14, color: "#1a1a1a", background: "#fff", boxSizing: "border-box", fontFamily: "inherit" };
const card = { background: "#fff", borderRadius: 14, border: "1px solid #e5e3dd", padding: 20 };

export default function App() {
  const [tab, setTab] = useState("onboarding");
  const [tasks, setTasks] = useLS("blok_tasks_v2", []);
  const [profile, setProfile] = useLS("blok_profile_v2", null);
  const [ob, setOb] = useState({ name: "", priv: false, pen: false });
  const [nf, setNf] = useState({ title: "", cat: "Academic", dl: "", reward: "", locType: "Remote", spot: "Mess", custom: "", gs: false });
  const [filter, setFilter] = useState("All");
  const [sortP, setSortP] = useState(false);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => { if (profile && tab === "onboarding") setTab("on_it"); }, [profile]);

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3200); };

  function handleOnboard() {
    if (!ob.name.trim()) return showToast("Enter your name.", "error");
    if (!ob.priv || !ob.pen) return showToast("Please accept both terms.", "error");
    setProfile({ name: ob.name.trim(), trustScore: 80, joinedAt: new Date().toISOString() });
    setTab("on_it");
  }

  function handlePost() {
    if (!nf.title.trim() || !nf.reward || !nf.dl) return showToast("Fill all required fields.", "error");
    const loc = nf.locType === "Remote" ? "Remote" : (nf.spot === "Other" ? nf.custom : nf.spot);
    const task = { id: genId(), title: nf.title.trim(), category: nf.cat, deadline: nf.dl, reward: parseFloat(nf.reward), locType: nf.locType, location: loc, genderSensitive: nf.gs, postedBy: profile.name, assignedTo: null, status: "Available", postedAt: new Date().toISOString() };
    setTasks(p => [task, ...p]);
    setNf({ title: "", cat: "Academic", dl: "", reward: "", locType: "Remote", spot: "Mess", custom: "", gs: false });
    showToast("Task posted! Check 'On It' to see it live.");
    setTab("on_it");
  }

  function acceptTask(id) {
    setTasks(p => p.map(t => t.id === id ? { ...t, status: "In Progress", assignedTo: profile.name } : t));
    showToast("Task accepted! Check your profile.");
  }

  function completeTask(task) {
    const late = isLate(task.deadline);
    const earned = late ? task.reward * 0.5 : task.reward;
    const penalty = late ? task.reward * 0.5 : 0;
    setTasks(p => p.map(t => t.id === task.id ? { ...t, status: "Done", completedAt: new Date().toISOString(), earned, penalty, late } : t));
    setProfile(p => ({ ...p, trustScore: Math.min(100, p.trustScore + (late ? -2 : 3)) }));
    setModal(null);
    showToast(late ? `Done — 50% penalty applied. Earned ₹${earned.toFixed(2)}.` : `Completed on time! Earned ₹${earned.toFixed(2)}.`, late ? "error" : "success");
  }

  const avail = useMemo(() => {
    let t = tasks.filter(t => t.status === "Available");
    if (filter === "Remote") t = t.filter(t => t.locType === "Remote");
    if (filter === "On-Site") t = t.filter(t => t.locType === "On-Site");
    if (sortP) t = [...t].sort((a, b) => a.reward - b.reward);
    return t;
  }, [tasks, filter, sortP]);

  const myDoing = tasks.filter(t => t.assignedTo === profile?.name && t.status === "In Progress");
  const myPosted = tasks.filter(t => t.postedBy === profile?.name);

  const TABS = [{ k: "need_it", l: "Need It", e: "📝" }, { k: "on_it", l: "On It", e: "🎯" }, { k: "profile", l: "Profile", e: "👤" }];

  return (
    <div style={{ fontFamily: "system-ui,sans-serif", background: "#f8f7f4", minHeight: "100vh", color: "#1a1a1a" }}>
      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e3dd", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0 0" }}>
            <div>
              <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.5px", color: "#6c47ff" }}>blok</span>
              <span style={{ fontSize: 11, color: "#888", marginLeft: 6 }}>campus economy</span>
            </div>
            {profile && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, color: "#6c47ff" }}>{profile.name[0].toUpperCase()}</div>
                <span style={{ fontSize: 12, color: "#666" }}>⭐ {profile.trustScore}</span>
              </div>
            )}
          </div>
          {profile && (
            <div style={{ display: "flex", marginTop: 12 }}>
              {TABS.map(t => (
                <button key={t.k} onClick={() => setTab(t.k)} style={{ flex: 1, padding: "10px 0", fontSize: 13, fontWeight: tab === t.k ? 600 : 400, background: "transparent", border: "none", cursor: "pointer", borderBottom: tab === t.k ? "2px solid #6c47ff" : "2px solid transparent", color: tab === t.k ? "#6c47ff" : "#666" }}>
                  {t.e} {t.l}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "20px 16px 80px" }}>

        {/* ONBOARDING */}
        {tab === "onboarding" && (
          <div>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>🏫</div>
              <h1 style={{ fontSize: 26, fontWeight: 700, color: "#6c47ff", margin: "0 0 8px" }}>Welcome to Blok</h1>
              <p style={{ color: "#666", fontSize: 14, margin: 0 }}>Your campus peer-to-peer task economy</p>
            </div>
            <div style={card}>
              <h2 style={{ fontSize: 16, fontWeight: 600, margin: "0 0 20px" }}>Create your account</h2>
              <label style={lbl}>Your Name</label>
              <input style={inp} placeholder="e.g. Arjun Sharma" value={ob.name} onChange={e => setOb(p => ({ ...p, name: e.target.value }))} onKeyDown={e => e.key === "Enter" && handleOnboard()} />
              <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 14 }}>
                <label style={{ display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer" }}>
                  <input type="checkbox" checked={ob.priv} onChange={e => setOb(p => ({ ...p, priv: e.target.checked }))} style={{ marginTop: 2, accentColor: "#6c47ff", width: 16, height: 16 }} />
                  <span style={{ fontSize: 13, color: "#444", lineHeight: 1.5 }}><strong>Maintenance of Privacy</strong> — My task info will only be visible to campus users and won't be shared externally.</span>
                </label>
                <label style={{ display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer" }}>
                  <input type="checkbox" checked={ob.pen} onChange={e => setOb(p => ({ ...p, pen: e.target.checked }))} style={{ marginTop: 2, accentColor: "#6c47ff", width: 16, height: 16 }} />
                  <span style={{ fontSize: 13, color: "#444", lineHeight: 1.5 }}><strong>Acceptance of Delay Penalty</strong> — Completing a task after its deadline results in a <strong>50% deduction</strong> of the agreed reward.</span>
                </label>
              </div>
              <button onClick={handleOnboard} style={{ width: "100%", marginTop: 20, padding: "13px 0", borderRadius: 10, border: "none", background: "#6c47ff", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>Join Blok →</button>
            </div>
            <p style={{ textAlign: "center", fontSize: 12, color: "#aaa", marginTop: 16 }}>No external accounts. All data stays on your device.</p>
          </div>
        )}

        {/* NEED IT */}
        {tab === "need_it" && profile && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 16px" }}>Post a Task</h2>
            <div style={card}>
              <label style={lbl}>Task Name *</label>
              <input style={inp} placeholder="e.g. Submit assignment to Prof. Sharma's cabin" value={nf.title} onChange={e => setNf(p => ({ ...p, title: e.target.value }))} />

              <label style={{ ...lbl, marginTop: 16 }}>Category *</label>
              <select style={inp} value={nf.cat} onChange={e => setNf(p => ({ ...p, cat: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
                <div>
                  <label style={lbl}>Deadline (IST) *</label>
                  <input style={inp} type="datetime-local" value={nf.dl} onChange={e => setNf(p => ({ ...p, dl: e.target.value }))} />
                </div>
                <div>
                  <label style={lbl}>Reward (₹) *</label>
                  <input style={inp} type="number" min="1" placeholder="50" value={nf.reward} onChange={e => setNf(p => ({ ...p, reward: e.target.value }))} />
                </div>
              </div>

              <label style={{ ...lbl, marginTop: 16 }}>Location</label>
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                {["Remote", "On-Site"].map(lt => (
                  <button key={lt} onClick={() => setNf(p => ({ ...p, locType: lt }))} style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: `1.5px solid ${nf.locType === lt ? "#6c47ff" : "#ddd"}`, background: nf.locType === lt ? "#ede9fe" : "#fff", color: nf.locType === lt ? "#6c47ff" : "#666", fontWeight: nf.locType === lt ? 600 : 400, fontSize: 13, cursor: "pointer" }}>
                    {lt === "Remote" ? "🌐 Remote" : "📍 On-Site"}
                  </button>
                ))}
              </div>
              {nf.locType === "On-Site" && (
                <div>
                  <label style={lbl}>Campus Spot</label>
                  <select style={inp} value={nf.spot} onChange={e => setNf(p => ({ ...p, spot: e.target.value }))}>
                    {CAMPUS_SPOTS.map(s => <option key={s}>{s}</option>)}
                    <option value="Other">Other (specify below)</option>
                  </select>
                  {nf.spot === "Other" && <input style={{ ...inp, marginTop: 8 }} placeholder="Describe the location" value={nf.custom} onChange={e => setNf(p => ({ ...p, custom: e.target.value }))} />}
                </div>
              )}

              <label style={{ display: "flex", gap: 10, alignItems: "center", cursor: "pointer", marginTop: 16 }}>
                <input type="checkbox" checked={nf.gs} onChange={e => setNf(p => ({ ...p, gs: e.target.checked }))} style={{ accentColor: "#6c47ff", width: 16, height: 16 }} />
                <span style={{ fontSize: 13, color: "#555" }}>🌸 Mark as Gender-Sensitive Task</span>
              </label>

              <button onClick={handlePost} style={{ width: "100%", marginTop: 20, padding: "13px 0", borderRadius: 10, border: "none", background: "#6c47ff", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>Post Task →</button>
            </div>
          </div>
        )}

        {/* ON IT */}
        {tab === "on_it" && profile && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Available Tasks</h2>
              <span style={{ fontSize: 12, color: "#888" }}>{avail.length} task{avail.length !== 1 ? "s" : ""}</span>
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
              {["All", "Remote", "On-Site"].map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{ padding: "6px 14px", borderRadius: 20, border: `1.5px solid ${filter === f ? "#6c47ff" : "#ddd"}`, background: filter === f ? "#ede9fe" : "#fff", color: filter === f ? "#6c47ff" : "#666", fontSize: 13, fontWeight: filter === f ? 600 : 400, cursor: "pointer" }}>{f}</button>
              ))}
              <button onClick={() => setSortP(p => !p)} style={{ padding: "6px 14px", borderRadius: 20, border: `1.5px solid ${sortP ? "#059669" : "#ddd"}`, background: sortP ? "#ecfdf5" : "#fff", color: sortP ? "#059669" : "#666", fontSize: 13, fontWeight: sortP ? 600 : 400, cursor: "pointer", marginLeft: "auto" }}>
                💰 {sortP ? "Price ↑" : "Sort Price"}
              </button>
            </div>
            {avail.length === 0
              ? <div style={{ textAlign: "center", padding: "48px 0", color: "#aaa" }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                  <p style={{ margin: 0, fontSize: 14 }}>No tasks available right now</p>
                  <p style={{ margin: "4px 0 0", fontSize: 12 }}>Switch to "Need It" to post one!</p>
                </div>
              : <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {avail.map(t => <TaskCard key={t.id} task={t} profile={profile} onAccept={acceptTask} />)}
                </div>}
          </div>
        )}

        {/* PROFILE */}
        {tab === "profile" && profile && (
          <div>
            <div style={{ ...card, marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, color: "#6c47ff" }}>{profile.name[0].toUpperCase()}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 18 }}>{profile.name}</div>
                  <div style={{ fontSize: 12, color: "#888" }}>Member since {fmtIST(profile.joinedAt)}</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: profile.trustScore >= 70 ? "#059669" : profile.trustScore >= 40 ? "#d97706" : "#dc2626" }}>{profile.trustScore}</div>
                  <div style={{ fontSize: 11, color: "#888" }}>Trust Score</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 16 }}>
                {[
                  ["Tasks Posted", myPosted.length],
                  ["In Progress", myDoing.length],
                  ["Completed", tasks.filter(t => t.assignedTo === profile.name && t.status === "Done").length]
                ].map(([l, v]) => (
                  <div key={l} style={{ background: "#f8f7f4", borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: "#6c47ff" }}>{v}</div>
                    <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {myDoing.length > 0 && (
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: "#444", margin: "0 0 10px" }}>🔧 Tasks I'm Doing</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                  {myDoing.map(t => (
                    <div key={t.id} style={{ ...card, padding: "14px 16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 4 }}>{t.title}</div>
                          <div style={{ fontSize: 12, color: "#888" }}>Posted by {t.postedBy} · Due {fmtIST(t.deadline)}</div>
                          {isLate(t.deadline) && <div style={{ fontSize: 11, color: "#dc2626", marginTop: 3 }}>⚠️ Deadline passed — 50% penalty on completion</div>}
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: "#6c47ff" }}>₹{t.reward}</div>
                      </div>
                      <button onClick={() => setModal(t)} style={{ marginTop: 12, width: "100%", padding: "8px 0", borderRadius: 8, background: isLate(t.deadline) ? "#fef2f2" : "#ecfdf5", border: `1.5px solid ${isLate(t.deadline) ? "#fca5a5" : "#6ee7b7"}`, color: isLate(t.deadline) ? "#dc2626" : "#059669", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                        {isLate(t.deadline) ? "⚠️ Complete (Penalty Applies)" : "✅ Mark Complete"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {myPosted.length > 0 && (
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: "#444", margin: "0 0 10px" }}>📋 Tasks I've Posted</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {myPosted.map(t => (
                    <div key={t.id} style={{ ...card, padding: "14px 16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 500, fontSize: 14 }}>{t.title}</div>
                          <div style={{ fontSize: 12, color: "#888", marginTop: 3 }}>Due {fmtIST(t.deadline)}</div>
                          {t.status === "Done" && t.late && <div style={{ fontSize: 11, color: "#dc2626", marginTop: 2 }}>Late penalty: ₹{t.penalty?.toFixed(2)} deducted</div>}
                          {t.assignedTo && t.status !== "Done" && <div style={{ fontSize: 11, color: "#059669", marginTop: 4 }}>🔄 Accepted by {t.assignedTo}</div>}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                          <span style={{ fontSize: 15, fontWeight: 700, color: "#6c47ff" }}>₹{t.reward}</span>
                          <StatusBadge status={t.status} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {myPosted.length === 0 && myDoing.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#aaa" }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>🌱</div>
                <p style={{ margin: 0, fontSize: 14 }}>No activity yet — post or accept a task!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* COMPLETE MODAL */}
      {modal && (
        <div onClick={e => e.target === e.currentTarget && setModal(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-end", zIndex: 100 }}>
          <div style={{ background: "#fff", borderRadius: "20px 20px 0 0", padding: 24, width: "100%", maxWidth: 480, margin: "0 auto", boxSizing: "border-box" }}>
            <div style={{ width: 40, height: 4, background: "#ddd", borderRadius: 2, margin: "0 auto 20px" }} />
            <h3 style={{ fontSize: 16, fontWeight: 600, margin: "0 0 16px" }}>Complete Task</h3>
            <div style={{ background: "#f8f7f4", borderRadius: 10, padding: 14, marginBottom: 16 }}>
              <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 6 }}>{modal.title}</div>
              <div style={{ fontSize: 12, color: "#888" }}>Deadline: {fmtIST(modal.deadline)}</div>
              <div style={{ fontSize: 12, color: "#888" }}>Full Reward: ₹{modal.reward}</div>
            </div>
            {isLate(modal.deadline) ? (
              <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 10, padding: 14, marginBottom: 20 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: "#dc2626", marginBottom: 8 }}>⚠️ Late Submission — 50% Penalty Applied</div>
                <div style={{ fontSize: 13, color: "#7f1d1d", display: "flex", flexDirection: "column", gap: 4 }}>
                  <div>Full reward: ₹{modal.reward}</div>
                  <div>Penalty deduction (50%): –₹{(modal.reward * 0.5).toFixed(2)}</div>
                  <div style={{ fontWeight: 700, marginTop: 4, fontSize: 14 }}>You will earn: ₹{(modal.reward * 0.5).toFixed(2)}</div>
                </div>
              </div>
            ) : (
              <div style={{ background: "#ecfdf5", border: "1px solid #6ee7b7", borderRadius: 10, padding: 14, marginBottom: 20 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: "#059669", marginBottom: 4 }}>✅ On Time — Full Reward Unlocked</div>
                <div style={{ fontSize: 13, color: "#064e3b" }}>You will earn: <strong>₹{modal.reward}</strong></div>
              </div>
            )}
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setModal(null)} style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: "1.5px solid #ddd", background: "#fff", color: "#666", fontWeight: 500, fontSize: 14, cursor: "pointer" }}>Cancel</button>
              <button onClick={() => completeTask(modal)} style={{ flex: 2, padding: "11px 0", borderRadius: 10, border: "none", background: "#6c47ff", color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>Confirm Completion</button>
            </div>
          </div>
        </div>
      )}

      <Toast toast={toast} />
    </div>
  );
}