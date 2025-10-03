import { useState } from "react";
import type { Task, TaskStatus } from "../types";

type Props = {
  task: Task;
  onUpdate: (id: string, patch: Partial<Task>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

const statuses: TaskStatus[] = ["To Do", "In Progress", "Done"];

export default function TaskItem({ task, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    await onUpdate(task._id, { title, description });
    setSaving(false);
    setEditing(false);
  };

  const changeStatus = async (s: TaskStatus) => {
    await onUpdate(task._id, { status: s });
  };

  const del = async () => {
    if (confirm("Delete this task?")) await onDelete(task._id);
  };

  const when = new Date(task.createdAt);
    const formatted = when.toLocaleString(undefined, {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
    });

  return (
    <div className="task card--light" data-status={task.status}>
      <div className="task-header">
        {editing ? (
          <input value={title} onChange={(e) => setTitle(e.target.value)} disabled={saving} />
        ) : (
          <h3>{task.title}</h3>
        )}
        <select value={task.status} onChange={(e) => changeStatus(e.target.value as TaskStatus)}>
          {statuses.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {editing ? (
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} disabled={saving} />
      ) : (
        task.description && <p className="desc">{task.description}</p>
      )}

      <div className="meta">
        <small>{formatted}</small>
        <div className="actions">
          {editing ? (
            <>
              <button onClick={save} disabled={saving}>Save</button>
              <button className="secondary" onClick={() => setEditing(false)} disabled={saving}>Cancel</button>
            </>
          ) : (
            <>
              <button onClick={() => setEditing(true)}>Edit</button>
              <button className="danger" onClick={del}>Delete</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
