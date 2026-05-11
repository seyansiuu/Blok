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

const C = {
  bg:           "#0D0D0F",
  surface:      "#141417",
  surfaceRaise: "#1C1C21",
  border:       "#2A2A31",
  borderBright: "#3A3A44",
  accent:       "#00E5C3",
  accentDim:    "#00C4A8",
  accentBg:     "#001F1A",
  accentBorder: "#00443A",
  text:         "#F0F0F4",
  textMuted:    "#8888A0",
  textFaint:    "#55555F",
  red:          "#FF4D5E",
  redBg:        "#1A0A0C",
  redBorder:    "#3D1219",
  green:        "#00D68F",
  greenBg:      "#001A10",
  greenBorder:  "#00402A",
  amber:        "#FFB547",
  cat: {
    Documentation: { bg: "#0F1425", color: "#7B9EFF" },
    Academic:      { bg: "#160F25", color: "#B57BFF" },
    Errands:       { bg: "#1A1005", color: "#FFB547" },
    Other:         { bg: "#151519", color: "#8888A0" },
  }
};

const inp = {
  width: "100%", padding: "10px 13px", borderRadius: 9,
  border: `1px solid ${C.border}`, fontSize: 14, color: C.text,
  background: C.surfaceRaise, boxSizing: "border-box",
  fontFamily: "inherit", outline: "none",
};

const lbl = {
  display: "block", fontSize: 10, fontWeight: 600,
  color: C.textFaint, marginBottom: 7,
  textTransform: "uppercase", letterSpacing: "0.1em",
};

const cardStyle = {
  background: C.surface,
  borderRadius: 14,
  border: `1px solid ${C.border}`,
  padding: "18px 20px",
};

function BlokLogo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{
        width: 30, height: 30, borderRadius: 9,
        background: C.accent,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="2" y="2" width="5" height="5" rx="1.5" fill="#001F1A"/>
          <rect x="9" y="2" width="5" height="5" rx="1.5" fill="#001F1A"/>
          <rect x="3" y="9" width="5" height="5" rx="1.5" fill="#001F1A"/>
          <rect x="9" y="9" width="5" height="5" rx="1.5" fill="#001F1A" opacity="0.35"/>
        </svg>
      </div>
      <div>
        <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.6px", color: C.text }}>blok</span>
        <span style={{ fontSize: 10, color: C.textFaint, marginLeft: 5, letterSpacing: "0.08em", fontWeight: 400 }}>campus economy</span>
      </div>
    </div>
  );
}

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div style={{
      position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)",
      background: toast.type === "error" ? C.redBg : C.accentBg,
      color: toast.type === "error" ? C.red : C.accent,
      border: `1px solid ${toast.type === "error" ? C.redBorder : C.accentBorder}`,
      padding: "10px 18px", borderRadius: 10,
      fontSize: 13, fontWeight: 500, zIndex: 200, maxWidth: 320,
      textAlign: "center",
    }}>
      {toast.msg}
    </div>
  );
}

function Pill({ children, style }) {
  return (
    <span style={{ fontSize: 11, fontWeight: 500, padding: "3px 9px", borderRadius: 6, letterSpacing: "0.02em", ...style }}>
      {children}
    </span>
  );
}

function CatPill({ cat }) {
  const s = C.cat[cat] || C.cat.Other;
  return <Pill style={{ background: s.bg, color: s.color }}>{cat}</Pill>;
}

function StatusDot({ status }) {
  const m = {
    Available:     { color: C.accent },
    "In Progress": { color: C.amber },
    Done:          { color: "#7B9EFF" },
    Denied:        { color: C.red },
  };
  const s = m[status] || m.Available;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, color: C.textMuted }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.color, display: "inline-block" }} />
      {status}
    </span>
  );
}

function PrimaryBtn({ onClick, children, style }) {
  return (
    <button onClick={onClick} style={{
      padding: "11px 0", borderRadius: 10, border: "none",
      background: C.accent, color: C.accentBg,
      fontWeight: 700, fontSize: 14, cursor: "pointer",
      fontFamily: "inherit", ...style
    }}>{children}</button>
  );
}

function TaskCard({ task, profile, onAccept, onDeny }) {
  const mine = task.postedBy === profile?.name;
  return (
    <div style={{ background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`, padding: "16px 18px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 8, alignItems: "center" }}>
            <CatPill cat={task.category} />
            {task.genderSensitive && <Pill style={{ background: "#1A0F1A", color: "#D478C4" }}>Gender-Sensitive</Pill>}
            {task.locType === "Remote"
              ? <Pill style={{ background: C.accentBg, color: C.accent }}>Remote</Pill>
              : <Pill style={{ background: C.greenBg, color: C.green }}>{task.location}</Pill>}
          </div>
          <div style={{ fontWeight: 600, fontSize: 14.5, lineHeight: 1.45, color: C.text }}>{task.title}</div>
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.accent, flexShrink: 0, letterSpacing: "-0.5px" }}>
          ₹{task.reward}
        </div>
      </div>
      <div style={{ fontSize: 12, color: C.textFaint, marginBottom: 13 }}>
        Due {fmtIST(task.deadline)} · {task.postedBy}
      </div>
      {!mine ? (
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => onAccept(task.id)} style={{
            flex: 1, padding: "8px 0", borderRadius: 8, border: "none",
            background: C.accent, color: C.accentBg, fontWeight: 700, fontSize: 13,
            cursor: "pointer", fontFamily: "inherit"
          }}>Accept</button>
          <button onClick={() => onDeny(task.id)} style={{
            flex: 1, padding: "8px 0", borderRadius: 8,
            border: `1px solid ${C.redBorder}`, background: C.redBg,
            color: C.red, fontWeight: 500, fontSize: 13, cursor: "pointer", fontFamily: "inherit"
          }}>Decline</button>
        </div>
      ) : (
        <div style={{
          padding: "7px 12px", background: C.surfaceRaise, borderRadius: 8,
          fontSize: 12, color: C.textFaint, textAlign: "center", border: `1px solid ${C.border}`
        }}>Your post</div>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 26 }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: C.textFaint, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 11 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function FilterChip({ label, active, onClick, activeColor, activeBg, activeBorder }) {
  return (
    <button onClick={onClick} style={{
      padding: "5px 13px", borderRadius: 7,
      border: `1px solid ${active ? (activeBorder || C.accentBorder) : C.border}`,
      background: active ? (activeBg || C.accentBg) : C.surfaceRaise,
      color: active ? (activeColor || C.accent) : C.textMuted,
      fontSize: 12, fontWeight: active ? 600 : 400, cursor: "pointer", fontFamily: "inherit",
    }}>{label}</button>
  );
}

export default function App() {
  const [tab, setTab] = useState("onboarding");
  const [tasks, setTasks] = useLS("blok_tasks_v5", []);
  const [profile, setProfile] = useLS("blok_profile_v5", null);
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
    const task = {
      id: genId(), title: nf.title.trim(), category: nf.cat,
      deadline: nf.dl, reward: parseFloat(nf.reward),
      locType: nf.locType, location: loc,
      genderSensitive: nf.gs, postedBy: profile.name,
      assignedTo: null, status: "Available", postedAt: new Date().toISOString()
    };
    setTasks(p => [task, ...p]);
    setNf({ title: "", cat: "Academic", dl: "", reward: "", locType: "Remote", spot: "Mess", custom: "", gs: false });
    showToast("Task posted — now live.");
    setTab("on_it");
  }

  function acceptTask(id) {
    setTasks(p => p.map(t => t.id === id ? { ...t, status: "In Progress", assignedTo: profile.name } : t));
    showToast("Task accepted.");
  }

  function denyTask(id) {
    setTasks(p => p.map(t => t.id === id ? { ...t, status: "Denied", deniedBy: profile.name, deniedAt: new Date().toISOString() } : t));
    showToast("Task declined.", "error");
  }

  function completeTask(task) {
    const late = isLate(task.deadline);
    const earned = late ? task.reward * 0.5 : task.reward;
    const penalty = late ? task.reward * 0.5 : 0;
    setTasks(p => p.map(t => t.id === task.id ? { ...t, status: "Done", completedAt: new Date().toISOString(), earned, penalty, late } : t));
    setProfile(p => ({ ...p, trustScore: Math.min(100, p.trustScore + (late ? -2 : 3)) }));
    setModal(null);
    showToast(late ? `Done. Earned ₹${earned.toFixed(2)} after penalty.` : `Completed. Earned ₹${earned.toFixed(2)}.`, late ? "error" : "success");
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
  const TABS = [{ k: "need_it", l: "Post" }, { k: "on_it", l: "Browse" }, { k: "profile", l: "Profile" }];
  const trustColor = profile?.trustScore >= 70 ? C.green : profile?.trustScore >= 40 ? C.amber : C.red;

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: C.bg, minHeight: "100vh", color: C.text }}>

      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 0 0" }}>
            <BlokLogo />
            {profile && (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 11, color: C.textFaint }}>
                  Trust <strong style={{ color: trustColor, fontWeight: 600 }}>{profile.trustScore}</strong>
                </span>
                <div style={{
                  width: 30, height: 30, borderRadius: "50%",
                  background: C.accentBg, border: `1px solid ${C.accentBorder}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 700, color: C.accent
                }}>{profile.name[0].toUpperCase()}</div>
              </div>
            )}
          </div>
          {profile && (
            <div style={{ display: "flex", marginTop: 12 }}>
              {TABS.map(t => (
                <button key={t.k} onClick={() => setTab(t.k)} style={{
                  flex: 1, padding: "9px 0", fontSize: 13,
                  fontWeight: tab === t.k ? 600 : 400,
                  background: "transparent", border: "none", cursor: "pointer",
                  borderBottom: tab === t.k ? `2px solid ${C.accent}` : "2px solid transparent",
                  color: tab === t.k ? C.accent : C.textMuted,
                  fontFamily: "inherit",
                }}>{t.l}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "24px 20px 80px" }}>

        {tab === "onboarding" && (
          <div>
            <div style={{ textAlign: "center", marginBottom: 36, paddingTop: 16 }}>
              <div style={{
                width: 60, height: 60, borderRadius: 18, background: C.accent,
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 20px",
              }}>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <rect x="3" y="3" width="9" height="9" rx="2.5" fill={C.accentBg}/>
                  <rect x="16" y="3" width="9" height="9" rx="2.5" fill={C.accentBg}/>
                  <rect x="3" y="16" width="9" height="9" rx="2.5" fill={C.accentBg}/>
                  <rect x="16" y="16" width="9" height="9" rx="2.5" fill={C.accentBg} opacity="0.35"/>
                </svg>
              </div>
              <h1 style={{ fontSize: 26, fontWeight: 700, color: C.text, margin: "0 0 8px", letterSpacing: "-0.7px" }}>
                Welcome to Blok
              </h1>
              <p style={{ color: C.textMuted, fontSize: 14, margin: 0, lineHeight: 1.6 }}>Campus peer-to-peer task economy</p>
            </div>

            <div style={cardStyle}>
              <label style={lbl}>Your Name</label>
              <input style={inp} placeholder="e.g. Arjun Sharma" value={ob.name}
                onChange={e => setOb(p => ({ ...p, name: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && handleOnboard()} />

              <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { key: "priv", title: "Privacy agreement", desc: "Task info is only visible to campus users — never shared externally." },
                  { key: "pen",  title: "Delay penalty",     desc: "Completing after deadline results in a 50% reward deduction." },
                ].map(({ key, title, desc }) => (
                  <label key={key} style={{
                    display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer",
                    padding: "12px 14px", borderRadius: 10,
                    background: ob[key] ? C.accentBg : C.surfaceRaise,
                    border: `1px solid ${ob[key] ? C.accentBorder : C.border}`,
                  }}>
                    <input type="checkbox" checked={ob[key]}
                      onChange={e => setOb(p => ({ ...p, [key]: e.target.checked }))}
                      style={{ marginTop: 2, accentColor: C.accent, width: 15, height: 15, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.6 }}>
                      <span style={{ fontWeight: 600, color: C.text }}>{title}</span> — {desc}
                    </span>
                  </label>
                ))}
              </div>

              <PrimaryBtn onClick={handleOnboard} style={{ width: "100%", marginTop: 20 }}>
                Create account →
              </PrimaryBtn>
            </div>
            <p style={{ textAlign: "center", fontSize: 11, color: C.textFaint, marginTop: 16 }}>All data stays on your device.</p>
          </div>
        )}

        {tab === "need_it" && profile && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 20px", letterSpacing: "-0.4px" }}>Post a Task</h2>
            <div style={cardStyle}>
              <label style={lbl}>Task Name *</label>
              <input style={inp} placeholder="e.g. Submit assignment to Prof. Sharma's cabin"
                value={nf.title} onChange={e => setNf(p => ({ ...p, title: e.target.value }))} />

              <label style={{ ...lbl, marginTop: 18 }}>Category</label>
              <select style={{ ...inp, appearance: "none" }} value={nf.cat} onChange={e => setNf(p => ({ ...p, cat: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 18 }}>
                <div>
                  <label style={lbl}>Deadline (IST) *</label>
                  <input style={inp} type="datetime-local" value={nf.dl} onChange={e => setNf(p => ({ ...p, dl: e.target.value }))} />
                </div>
                <div>
                  <label style={lbl}>Reward (₹) *</label>
                  <input style={inp} type="number" min="1" placeholder="50" value={nf.reward} onChange={e => setNf(p => ({ ...p, reward: e.target.value }))} />
                </div>
              </div>

              <label style={{ ...lbl, marginTop: 18 }}>Location</label>
              <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                {["Remote", "On-Site"].map(lt => (
                  <button key={lt} onClick={() => setNf(p => ({ ...p, locType: lt }))} style={{
                    flex: 1, padding: "9px 0", borderRadius: 9,
                    border: `1px solid ${nf.locType === lt ? C.accentBorder : C.border}`,
                    background: nf.locType === lt ? C.accentBg : C.surfaceRaise,
                    color: nf.locType === lt ? C.accent : C.textMuted,
                    fontWeight: nf.locType === lt ? 600 : 400,
                    fontSize: 13, cursor: "pointer", fontFamily: "inherit",
                  }}>{lt}</button>
                ))}
              </div>

              {nf.locType === "On-Site" && (
                <div style={{ marginBottom: 14 }}>
                  <label style={lbl}>Campus Spot</label>
                  <select style={{ ...inp, appearance: "none" }} value={nf.spot} onChange={e => setNf(p => ({ ...p, spot: e.target.value }))}>
                    {CAMPUS_SPOTS.map(s => <option key={s}>{s}</option>)}
                    <option value="Other">Other</option>
                  </select>
                  {nf.spot === "Other" && (
                    <input style={{ ...inp, marginTop: 8 }} placeholder="Describe location"
                      value={nf.custom} onChange={e => setNf(p => ({ ...p, custom: e.target.value }))} />
                  )}
                </div>
              )}

              <label style={{ display: "flex", gap: 10, alignItems: "center", cursor: "pointer", marginTop: 14 }}>
                <input type="checkbox" checked={nf.gs} onChange={e => setNf(p => ({ ...p, gs: e.target.checked }))}
                  style={{ accentColor: C.accent, width: 15, height: 15 }} />
                <span style={{ fontSize: 13, color: C.textMuted }}>Mark as Gender-Sensitive</span>
              </label>

              <PrimaryBtn onClick={handlePost} style={{ width: "100%", marginTop: 22 }}>Post Task →</PrimaryBtn>
            </div>
          </div>
        )}

        {tab === "on_it" && profile && (
          <div>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 18 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, letterSpacing: "-0.4px" }}>Browse Tasks</h2>
              <span style={{ fontSize: 12, color: C.textFaint }}>{avail.length} available</span>
            </div>

            <div style={{ display: "flex", gap: 7, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
              {["All", "Remote", "On-Site"].map(f => (
                <FilterChip key={f} label={f} active={filter === f} onClick={() => setFilter(f)} />
              ))}
              <FilterChip label="↑ Price" active={sortP} onClick={() => setSortP(p => !p)}
                activeColor={C.green} activeBg={C.greenBg} activeBorder={C.greenBorder} />
            </div>

            {avail.length === 0 ? (
              <div style={{ textAlign: "center", padding: "64px 0" }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, background: C.surfaceRaise,
                  border: `1px solid ${C.border}`, margin: "0 auto 18px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20, color: C.textFaint
                }}>—</div>
                <p style={{ margin: 0, fontSize: 14, color: C.textMuted }}>No tasks available</p>
                <p style={{ margin: "5px 0 0", fontSize: 13, color: C.textFaint }}>Post one in the Post tab</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {avail.map(t => <TaskCard key={t.id} task={t} profile={profile} onAccept={acceptTask} onDeny={denyTask} />)}
              </div>
            )}
          </div>
        )}

        {tab === "profile" && profile && (
          <div>
            <div style={{ ...cardStyle, marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                <div style={{
                  width: 46, height: 46, borderRadius: "50%",
                  background: C.accentBg, border: `1.5px solid ${C.accentBorder}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, fontWeight: 700, color: C.accent
                }}>{profile.name[0].toUpperCase()}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 16, letterSpacing: "-0.3px" }}>{profile.name}</div>
                  <div style={{ fontSize: 12, color: C.textFaint, marginTop: 2 }}>Since {fmtIST(profile.joinedAt)}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 26, fontWeight: 700, color: trustColor, letterSpacing: "-1px" }}>{profile.trustScore}</div>
                  <div style={{ fontSize: 10, color: C.textFaint, textTransform: "uppercase", letterSpacing: "0.07em" }}>Trust</div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8 }}>
                {[
                  ["Posted", myPosted.length],
                  ["Active", myDoing.length],
                  ["Done",   tasks.filter(t => t.assignedTo === profile.name && t.status === "Done").length]
                ].map(([l, v]) => (
                  <div key={l} style={{
                    background: C.surfaceRaise, borderRadius: 10, padding: "12px 8px",
                    textAlign: "center", border: `1px solid ${C.border}`
                  }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: C.accent, letterSpacing: "-1px" }}>{v}</div>
                    <div style={{ fontSize: 10, color: C.textFaint, marginTop: 3, textTransform: "uppercase", letterSpacing: "0.07em" }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {myDoing.length > 0 && (
              <Section title="Tasks I'm doing">
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {myDoing.map(t => (
                    <div key={t.id} style={{ ...cardStyle, padding: "14px 16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 550, fontSize: 14, marginBottom: 3 }}>{t.title}</div>
                          <div style={{ fontSize: 12, color: C.textFaint }}>by {t.postedBy} · Due {fmtIST(t.deadline)}</div>
                          {isLate(t.deadline) && <div style={{ fontSize: 11, color: C.red, marginTop: 5, fontWeight: 500 }}>Overdue — 50% penalty</div>}
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: C.accent }}>₹{t.reward}</div>
                      </div>
                      <button onClick={() => setModal(t)} style={{
                        width: "100%", padding: "8px 0", borderRadius: 8, fontFamily: "inherit",
                        background: isLate(t.deadline) ? C.redBg : C.greenBg,
                        border: `1px solid ${isLate(t.deadline) ? C.redBorder : C.greenBorder}`,
                        color: isLate(t.deadline) ? C.red : C.green,
                        fontWeight: 550, fontSize: 13, cursor: "pointer"
                      }}>
                        {isLate(t.deadline) ? "Complete (penalty applies)" : "Mark complete"}
                      </button>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {myPosted.length > 0 && (
              <Section title="Tasks I've posted">
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {myPosted.map(t => (
                    <div key={t.id} style={{ ...cardStyle, padding: "13px 16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 3 }}>{t.title}</div>
                          <div style={{ fontSize: 12, color: C.textFaint }}>Due {fmtIST(t.deadline)}</div>
                          {t.assignedTo && t.status === "In Progress" && <div style={{ fontSize: 11, color: C.green, marginTop: 4, fontWeight: 500 }}>Accepted by {t.assignedTo}</div>}
                          {t.status === "Denied" && <div style={{ fontSize: 11, color: C.red, marginTop: 4 }}>Declined by a user</div>}
                          {t.status === "Done" && t.late && <div style={{ fontSize: 11, color: C.red, marginTop: 4 }}>Late · ₹{t.penalty?.toFixed(2)} penalty</div>}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: C.accent }}>₹{t.reward}</span>
                          <StatusDot status={t.status} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {myPosted.length === 0 && myDoing.length === 0 && (
              <div style={{ textAlign: "center", padding: "52px 0" }}>
                <p style={{ margin: 0, fontSize: 14, color: C.textMuted }}>No activity yet</p>
                <p style={{ margin: "5px 0 0", fontSize: 13, color: C.textFaint }}>Post or accept tasks to get started</p>
              </div>
            )}
          </div>
        )}
      </div>

      {modal && (
        <div onClick={e => e.target === e.currentTarget && setModal(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "flex-end", zIndex: 100 }}>
          <div style={{
            background: C.surface, borderRadius: "20px 20px 0 0",
            padding: "24px 24px 36px", width: "100%", maxWidth: 480,
            margin: "0 auto", boxSizing: "border-box",
            borderTop: `1px solid ${C.borderBright}`,
          }}>
            <div style={{ width: 36, height: 4, background: C.border, borderRadius: 2, margin: "0 auto 22px" }} />
            <div style={{ fontSize: 16, fontWeight: 650, marginBottom: 16 }}>Complete Task</div>

            <div style={{ background: C.surfaceRaise, borderRadius: 10, padding: "13px 16px", marginBottom: 16, border: `1px solid ${C.border}` }}>
              <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 5 }}>{modal.title}</div>
              <div style={{ fontSize: 12, color: C.textFaint }}>Deadline: {fmtIST(modal.deadline)}</div>
              <div style={{ fontSize: 12, color: C.textFaint }}>Full reward: ₹{modal.reward}</div>
            </div>

            {isLate(modal.deadline) ? (
              <div style={{ background: C.redBg, border: `1px solid ${C.redBorder}`, borderRadius: 10, padding: "14px 16px", marginBottom: 20 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: C.red, marginBottom: 8 }}>Late — 50% penalty</div>
                <div style={{ fontSize: 13, color: C.red, display: "flex", flexDirection: "column", gap: 3, opacity: 0.85 }}>
                  <div>Full reward: ₹{modal.reward}</div>
                  <div>Penalty: −₹{(modal.reward * 0.5).toFixed(2)}</div>
                  <div style={{ fontWeight: 700, marginTop: 6, fontSize: 15, opacity: 1 }}>You earn: ₹{(modal.reward * 0.5).toFixed(2)}</div>
                </div>
              </div>
            ) : (
              <div style={{ background: C.greenBg, border: `1px solid ${C.greenBorder}`, borderRadius: 10, padding: "14px 16px", marginBottom: 20 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: C.green, marginBottom: 4 }}>On time — full reward</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.green }}>You earn: ₹{modal.reward}</div>
              </div>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setModal(null)} style={{
                flex: 1, padding: "11px 0", borderRadius: 10,
                border: `1px solid ${C.border}`, background: C.surfaceRaise,
                color: C.textMuted, fontWeight: 500, fontSize: 14, cursor: "pointer", fontFamily: "inherit"
              }}>Cancel</button>
              <PrimaryBtn onClick={() => completeTask(modal)} style={{ flex: 2 }}>Confirm</PrimaryBtn>
            </div>
          </div>
        </div>
      )}

      <Toast toast={toast} />
    </div>
  );
}