import Task from './task'

interface TaskList {
    id: number;
    title: string;
    tasks: Task[];
    createdAt: Date;
    updatedAt: Date;
}