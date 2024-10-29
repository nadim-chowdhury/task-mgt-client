import axios from "axios";
import { demoData } from "./demoData";

export const API_URL =
  `${process.env.NEXT_PUBLIC_API_URL}/api/tasks` ||
  "http://localhost:5000/api/tasks";

export const fetchTasks = async () => {
  const response = await axios.get(API_URL);
  return response.data || demoData;
};

export const createTask = async (task: {
  title: string;
  description: string;
  position: number; // Add position to the expected type
}) => {
  const response = await axios.post(API_URL, task);
  return response.data;
};

export const updateTaskById = async (
  id: string,
  updatedTask: {
    title: string;
    description: string;
    status: string;
    position?: number;
  }
) => {
  const response = await axios.put(`${API_URL}/${id}`, updatedTask);
  return response.data;
};

export const deleteTaskById = async (id: string) => {
  await axios.delete(`${API_URL}/${id}`);
};
