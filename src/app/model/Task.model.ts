import { Comment } from "./Comment.model";

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  
  DONE = 'DONE'
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export interface Task {
  id?: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: {
    id: number;
    username: string;
    email:String;
  };
  deadline?: string;
  color?: string;
  storyPoints?: number;
  kanbanId?: number;
  comments?: Comment[];
}