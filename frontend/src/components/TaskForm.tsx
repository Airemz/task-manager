import { useState, type FormEvent } from "react";
import type { TaskStatus } from "../types";

type Props = {
  onCreate: (input: { title: string; description?: string; status: TaskStatus }) => Promise<void>;
};

const statuses: TaskStatus[] = ["To Do", "In Progress", "Done"];

export default function TaskForm({ onCreate }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("To Do");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!title.trim()) {
      setErr("Title is required.");
      return;
    }
    setSubmitting(true);
    try {
      await onCreate({ title: title.trim(), description: description.trim(), status });
      setTitle("");
      setDescription("");
      setStatus("To Do");
    } catch (e: any) {
      setErr(e.message || "Failed to create task");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="card card--light" onSubmit={submit}>
      <h2>Create Task</h2>
      <div className="row">
        <input
          placeholder="Title *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={submitting}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)} disabled={submitting}>
          {statuses.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      <textarea
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        disabled={submitting}
      />
      <div className="row">
        <button type="submit" disabled={submitting}>Add</button>
        {err && <span className="error">{err}</span>}
      </div>
    </form>
  );
}
