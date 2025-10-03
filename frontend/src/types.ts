export type TaskStatus = "To Do" | "In Progress" | "Done";

export type Task = {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  createdAt: string; // ISO date
};
