import { useEffect, useMemo, useState } from "react";
import { api } from "./api";
import type { Task, TaskStatus } from "./types";
import TaskForm from "./components/TaskForm";
import TaskItem from "./components/TaskItem";
import "./index.css";

const ALL = "All";

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);          // first load only
  const [refreshing, setRefreshing] = useState(false);    // keep list visible
  const [err, setErr] = useState<string | null>(null);
  const [filter, setFilter] = useState<typeof ALL | TaskStatus>(ALL);

  const load = async (opts?: { silent?: boolean }) => {
    setErr(null);
    if (opts?.silent) setRefreshing(true); else setLoading(true);
    try {
      const data = (await api.list()) as Task[];
      setTasks(data);
    } catch (e: any) {
      setErr(e.message || "Failed to load tasks");
    } finally {
      if (opts?.silent) setRefreshing(false); else setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onCreate = async (input: { title: string; description?: string; status: TaskStatus }) => {
    await api.create(input);
    // do a silent refresh so the list doesn't disappear
    await load({ silent: true });
  };

  const onUpdate = async (id: string, patch: Partial<Task>) => {
    await api.update(id, patch);
    // optimistic update
    setTasks(prev => prev.map(t => (t._id === id ? { ...t, ...patch } as Task : t)));
  };

  const onDelete = async (id: string) => {
    await api.remove(id);
    // optimistic update
    setTasks(prev => prev.filter(t => t._id !== id));
  };

  const filtered = useMemo(
    () => (filter === ALL ? tasks : tasks.filter(t => t.status === filter)),
    [tasks, filter]
  );

  return (
    <div className="container">
      <header>
        <h1>Tasks</h1>
        <div className="filters">
          <select value={filter} onChange={(e) => setFilter(e.target.value as any)}>
            {[ALL, "To Do", "In Progress", "Done"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button
            className="secondary"
            onClick={() => load({ silent: true })}
            disabled={refreshing}
          >
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </header>

      <TaskForm onCreate={onCreate} />

      {loading && tasks.length === 0 ? (
        <div className="card">Loading…</div>
      ) : err ? (
        <div className="card error">{err}</div>
      ) : filtered.length === 0 ? (
        <div className="card">No tasks yet.</div>
      ) : (
        <div className={`list ${refreshing ? "is-refreshing" : ""}`}>
          {filtered.map((t) => (
            <TaskItem key={t._id} task={t} onUpdate={onUpdate} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
