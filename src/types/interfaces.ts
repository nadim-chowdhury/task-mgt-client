interface Task {
  id: string;
  content: string;
  description: string;
  position: number;
}

interface Column {
  id: string;
  title: string;
  items: Task[];
}

export interface TaskList {
  [key: string]: Column;
}

export interface APITask {
  _id: string;
  title: string;
  description: string;
  status: string;
  position: number;
}
