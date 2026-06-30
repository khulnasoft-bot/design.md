import { useState, useEffect, useCallback } from "react";
import { health, listTools, listProjects, getProject, listScreens, generateScreen, editScreens, generateVariants } from "./api";
import "./styles.css";

type View = "projects" | "prompt" | "tools" | "settings";

export default function App() {
  const [view, setView] = useState<View>("projects");
  const [connected, setConnected] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [projectCount, setProjectCount] = useState(0);
  const [toolCount, setToolCount] = useState(0);

  useEffect(() => {
    health().then((h) => {
      setConnected(true);
      if ((h as Record<string, unknown>).hasKey) {
        listProjects().then((p) => {
          const projects = (p as Record<string, unknown>).projects as Array<unknown> | undefined;
          setProjectCount(projects?.length ?? 0);
        }).catch(() => {});
        listTools().then((t) => setToolCount(t.tools.length)).catch(() => {});
      }
    }).catch(() => setConnected(false));
  }, []);

  return (
    <div className="layout">
      <Sidebar view={view} onView={setView} connected={connected} projectCount={projectCount} toolCount={toolCount} />
      <div className="main">
        <div className="toolbar">
          <h2>{view === "projects" ? "Projects" : view === "prompt" ? "Prompt Sandbox" : view === "tools" ? "Tools Explorer" : "Settings"}</h2>
          <span className={`status ${connected ? "connected" : "disconnected"}`}>
            {connected ? "Connected" : "Disconnected"}
          </span>
        </div>
        <div className="config-bar">
          <label>API Key:</label>
          <input type="password" placeholder="stitch_api_key" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
          <span style={{ color: "#8b949e", fontSize: 11 }}>Required for MCP calls</span>
        </div>
        <div className="content">
          {view === "projects" && <ProjectsPanel apiKey={apiKey} />}
          {view === "prompt" && <PromptSandbox apiKey={apiKey} />}
          {view === "tools" && <ToolsPanel />}
          {view === "settings" && <SettingsPanel />}
        </div>
      </div>
    </div>
  );
}

function Sidebar({ view, onView, connected, projectCount, toolCount }: {
  view: View; onView: (v: View) => void; connected: boolean; projectCount: number; toolCount: number;
}) {
  const items: Array<{ id: View; label: string; badge?: number }> = [
    { id: "projects", label: "Projects", badge: projectCount },
    { id: "prompt", label: "Prompt Sandbox" },
    { id: "tools", label: "Tools", badge: toolCount },
    { id: "settings", label: "Settings" },
  ];
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1>🧵 Stitch</h1>
        <p>Playground Explorer</p>
      </div>
      <div className="sidebar-nav">
        {items.map((item) => (
          <div key={item.id} className={`nav-item ${view === item.id ? "active" : ""}`} onClick={() => onView(item.id)}>
            {item.label}
            {item.badge !== undefined && <span className="badge">{item.badge}</span>}
          </div>
        ))}
      </div>
      <div style={{ padding: "12px 16px", borderTop: "1px solid #30363d", fontSize: 11, color: "#8b949e" }}>
        {connected ? "🟢 API Connected" : "🔴 API Disconnected"}
      </div>
    </div>
  );
}

/* ─── Projects Panel ─────────────────────────────────────────── */

function ProjectsPanel({ apiKey }: { apiKey: string }) {
  const [projects, setProjects] = useState<Array<Record<string, unknown>>>([]);
  const [selected, setSelected] = useState<Record<string, unknown> | null>(null);
  const [screens, setScreens] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!apiKey) return;
    setLoading(true);
    setError("");
    try {
      const p = await listProjects();
      setProjects((p as Record<string, unknown>).projects as Array<Record<string, unknown>>);
    } catch (e) {
      setError((e as Error).message);
    }
    setLoading(false);
  }, [apiKey]);

  useEffect(() => { load(); }, [load]);

  const selectProject = async (p: Record<string, unknown>) => {
    setSelected(p);
    try {
      const full = await getProject(p.name as string);
      setSelected(full);
      const s = await listScreens((full as Record<string, unknown>).projectId as string);
      setScreens((s as Record<string, unknown>).screens as Array<Record<string, unknown>> || []);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  if (!apiKey) return <div className="empty"><p>Enter your Stitch API key above to browse projects.</p></div>;
  if (loading) return <div className="loading">Loading projects</div>;
  if (error) return <div className="empty"><p>Error: {error}</p><button className="btn btn-secondary" onClick={load}>Retry</button></div>;

  return (
    <div className="grid-2" style={{ alignItems: "start" }}>
      <div>
        <h3 style={{ marginBottom: 12, fontSize: 14, color: "#8b949e" }}>Projects ({projects.length})</h3>
        {projects.length === 0 && <div className="empty"><p>No projects found.</p></div>}
        {projects.map((p) => (
          <div key={p.name as string} className="project-card" onClick={() => selectProject(p)}
            style={{ borderColor: selected?.name === p.name ? "#58a6ff" : undefined }}>
            <h3>{(p.title as string) || (p.name as string)?.split("/").pop()}</h3>
            <div className="meta">
              <span>{p.deviceType as string || ""}</span>
              <span>{p.visibility as string || ""}</span>
              <span>{p.createTime as string ? new Date(p.createTime as string).toLocaleDateString() : ""}</span>
            </div>
          </div>
        ))}
        <button className="btn btn-secondary" onClick={load} style={{ marginTop: 8 }}>Refresh</button>
      </div>

      <div>
        {selected && (
          <>
            <h3 style={{ marginBottom: 12, fontSize: 14, color: "#8b949e" }}>{(selected.title as string) || "Project Detail"}</h3>
            <div className="card">
              <h3>Details</h3>
              <div className="json-view">{JSON.stringify({
                projectId: selected.projectId,
                deviceType: selected.deviceType,
                visibility: selected.visibility,
                createTime: selected.createTime,
                designTheme: selected.designTheme,
              }, null, 2)}</div>
            </div>
            {screens.length > 0 && (
              <div className="card">
                <h3>Screens ({screens.length})</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {screens.map((s) => (
                    <div key={s.id as string} style={{ padding: "8px 10px", background: "#0d1117", borderRadius: 6, fontSize: 13 }}>
                      <span style={{ fontFamily: "mono" }}>{s.id as string}</span>
                      <span style={{ color: "#8b949e", marginLeft: 8 }}>
                        {(s.width as string || "?")}x{(s.height as string || "?")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Prompt Sandbox ─────────────────────────────────────────── */

function PromptSandbox({ apiKey }: { apiKey: string }) {
  const [mode, setMode] = useState<"generate" | "edit" | "variants">("generate");
  const [projectId, setProjectId] = useState("");
  const [screenIds, setScreenIds] = useState("");
  const [prompt, setPrompt] = useState("");
  const [deviceType, setDeviceType] = useState("DESKTOP");
  const [creativeRange, setCreativeRange] = useState("EXPLORE");
  const [variantCount, setVariantCount] = useState(3);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | string | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!apiKey || !projectId || !prompt) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      let res: Record<string, unknown>;
      if (mode === "generate") {
        res = await generateScreen(projectId, prompt, deviceType);
      } else if (mode === "edit") {
        const ids = screenIds.split(",").map((s) => s.trim()).filter(Boolean);
        res = await editScreens(projectId, ids, prompt);
      } else {
        const ids = screenIds.split(",").map((s) => s.trim()).filter(Boolean);
        res = await generateVariants(projectId, ids, prompt, {
          variantCount,
          creativeRange,
        });
      }
      setResult(res);
    } catch (e) {
      setError((e as Error).message);
    }
    setLoading(false);
  };

  if (!apiKey) return <div className="empty"><p>Enter your Stitch API key above to use the prompt sandbox.</p></div>;

  return (
    <div className="grid-2" style={{ alignItems: "start" }}>
      <div>
        <div className="tab-bar">
          {(["generate", "edit", "variants"] as const).map((m) => (
            <div key={m} className={`tab ${mode === m ? "active" : ""}`} onClick={() => setMode(m)}>
              {m === "generate" ? "Generate" : m === "edit" ? "Edit" : "Variants"}
            </div>
          ))}
        </div>

        <div className="card">
          <div className="form-group">
            <label>Project ID</label>
            <input placeholder="e.g. 4044680601076201931" value={projectId} onChange={(e) => setProjectId(e.target.value)} />
          </div>

          {mode !== "generate" && (
            <div className="form-group">
              <label>Screen IDs (comma-separated)</label>
              <input placeholder="e.g. 98b50e2ddc9943efb..." value={screenIds} onChange={(e) => setScreenIds(e.target.value)} />
            </div>
          )}

          {mode === "generate" && (
            <div className="form-group">
              <label>Device Type</label>
              <select value={deviceType} onChange={(e) => setDeviceType(e.target.value)}>
                <option value="MOBILE">Mobile</option>
                <option value="DESKTOP">Desktop</option>
                <option value="TABLET">Tablet</option>
                <option value="AGNOSTIC">Agnostic</option>
              </select>
            </div>
          )}

          {mode === "variants" && (
            <>
              <div className="form-group">
                <label>Creative Range</label>
                <select value={creativeRange} onChange={(e) => setCreativeRange(e.target.value)}>
                  <option value="REFINE">Refined (subtle)</option>
                  <option value="EXPLORE">Explore (balanced)</option>
                  <option value="REIMAGINE">Reimagine (radical)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Variant Count (1-5)</label>
                <input type="number" min={1} max={5} value={variantCount} onChange={(e) => setVariantCount(parseInt(e.target.value) || 3)} />
              </div>
            </>
          )}

          <div className="form-group">
            <label>Prompt</label>
            <textarea rows={6} placeholder="Describe the screen to generate..." value={prompt} onChange={(e) => setPrompt(e.target.value)} />
          </div>

          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading || !projectId || !prompt}>
            {loading ? "Running..." : mode === "generate" ? "Generate Screen" : mode === "edit" ? "Edit Screen" : "Generate Variants"}
          </button>
        </div>

        {error && <div className="card" style={{ borderColor: "#da3633" }}><p style={{ color: "#f85149" }}>{error}</p></div>}
      </div>

      <div>
        <h3 style={{ marginBottom: 12, fontSize: 14, color: "#8b949e" }}>Result</h3>
        {loading ? <div className="loading">Generating</div> : result ? (
          <div className="card">
            <div className="json-view">{typeof result === "string" ? result : JSON.stringify(result, null, 2)}</div>
          </div>
        ) : (
          <div className="empty"><p>Run a prompt to see results here.</p></div>
        )}
      </div>
    </div>
  );
}

/* ─── Tools Panel ────────────────────────────────────────────── */

function ToolsPanel() {
  const [tools, setTools] = useState<Array<{ name: string; description: string }>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    listTools().then((t) => setTools(t.tools)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading tools</div>;
  if (tools.length === 0) return <div className="empty"><p>No tools available. Check your API connection.</p></div>;

  return (
    <div className="grid-3">
      {tools.map((t) => (
        <div key={t.name} className="card">
          <h3 style={{ fontFamily: "'SF Mono', Monaco, monospace", fontSize: 13 }}>{t.name}</h3>
          <p>{t.description}</p>
        </div>
      ))}
    </div>
  );
}

/* ─── Settings Panel ─────────────────────────────────────────── */

function SettingsPanel() {
  const [status, setStatus] = useState<Record<string, unknown> | null>(null);
  const [toolList, setToolList] = useState<Array<{ name: string }>>([]);

  useEffect(() => {
    health().then(setStatus).catch(() => setStatus({ error: "Failed to connect" }));
    listTools().then((t) => setToolList(t.tools)).catch(() => {});
  }, []);

  return (
    <div className="grid-2">
      <div className="card">
        <h3>Connection</h3>
        <div className="json-view">{JSON.stringify(status, null, 2)}</div>
      </div>
      <div className="card">
        <h3>Available MCP Tools ({toolList.length})</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {toolList.map((t) => (
            <div key={t.name} style={{ fontSize: 12, fontFamily: "'SF Mono', Monaco, monospace", padding: "2px 0" }}>
              {t.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
