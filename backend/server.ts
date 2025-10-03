import dotenv from "dotenv";
import express, { Request, Response, NextFunction } from "express";
import mongoose, { Schema, model, isValidObjectId } from "mongoose";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { z } from "zod";



// ---------- Config ----------
dotenv.config({ path: ".env" });
const PORT = parseInt(process.env.PORT ?? "4000", 10);
const MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/task_manager";

// ---------- Mongoose Model ----------
type TaskStatus = "To Do" | "In Progress" | "Done";
interface TaskDoc {
  title: string;
  description?: string;
  status: TaskStatus;
  createdAt: Date;
}

const TaskSchema = new Schema<TaskDoc>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    status: { type: String, enum: ["To Do", "In Progress", "Done"], default: "To Do" },
    createdAt: { type: Date, default: Date.now, index: true },
  },
  { versionKey: false }
);

const Task = model<TaskDoc>("Task", TaskSchema);

// ---------- Validation (Zod, inline) ----------
const statusEnum = z.enum(["To Do", "In Progress", "Done"]);
const createTaskSchema = z.object({
  title: z.string().min(1, "title is required"),
  description: z.string().optional(),
  status: statusEnum.optional(),
});
const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: statusEnum.optional(),
});


// ---------- Express App ----------
const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_req, res) => res.json({ ok: true }));

// Create
app.post("/tasks", asyncHandler(async (req, res) => {
  const body = parseOrThrow(createTaskSchema, req.body);
  const task = await Task.create(body);
  res.status(201).json(task);
}));

// Read all
app.get("/tasks", asyncHandler(async (_req, res) => {
  const tasks = await Task.find().sort({ createdAt: -1 });
  res.json(tasks);
}));

// Read by id
app.get("/tasks/:id", asyncHandler(async (req: Request, res: Response) => {
  const id = assertObjectId(getIdParam(req));
  const task = await Task.findById(id);
  if (!task) return res.status(404).json({ message: "Task not found" });
  res.json(task);
}));

// Update
app.put("/tasks/:id", asyncHandler(async (req: Request, res: Response) => {
  const id = assertObjectId(getIdParam(req));
  const patch = parseOrThrow(updateTaskSchema, req.body);
  const task = await Task.findByIdAndUpdate(id, patch, { new: true, runValidators: true });
  if (!task) return res.status(404).json({ message: "Task not found" });
  res.json(task);
}));

// Delete
app.delete("/tasks/:id", asyncHandler(async (req: Request, res: Response) => {
  const id = assertObjectId(getIdParam(req));
  const del = await Task.findByIdAndDelete(id);
  if (!del) return res.status(404).json({ message: "Task not found" });
  res.status(204).end();
}));



// 404 + error middleware
app.use((_req, res) => res.status(404).json({ message: "Route not found" }));
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (process.env.NODE_ENV !== "production") console.error(err);
  const status = typeof err?.statusCode === "number" ? err.statusCode : 500;
  res.status(status).json({ message: err?.message ?? "Server error" });
});

// ---------- Boot ----------
(async function start() {
  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(MONGODB_URI);
    const server = app.listen(PORT, () => {
      console.log(`API listening on http://localhost:${PORT}`);
    });

    const shutdown = (signal: string) => () => {
      console.log(`Received ${signal}, shutting down...`);
      server.close(() => mongoose.connection.close().then(() => process.exit(0)));
    };
    process.on("SIGINT", shutdown("SIGINT"));
    process.on("SIGTERM", shutdown("SIGTERM"));
  } catch (e) {
    console.error("Boot failure:", e);
    process.exit(1);
  }
})();

// ---------- Tiny helpers (inline) ----------
function asyncHandler<T extends (req: Request, res: Response, next: NextFunction) => any>(
  fn: T
) {
  return (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);
}

function parseOrThrow<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const r = schema.safeParse(data);
  if (!r.success) {
    const msg = r.error.issues.map(i => i.message).join("; ");
    const err: any = new Error(msg);
    err.statusCode = 400;
    throw err;
  }
  return r.data;
}

function assertObjectId(id: string) {
  if (!isValidObjectId(id)) {
    const err: any = new Error("Invalid ID format");
    err.statusCode = 400;
    throw err;
  }
  return id;
}

function getIdParam(req: Request): string {
  const id = (req.params as Record<string, string | undefined>).id;
  if (!id) {
    const err: any = new Error("Missing id param");
    err.statusCode = 400;
    throw err;
  }
  return id;
}