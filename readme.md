# run test
- docker-compose run --rm task-api npm install & npm test

# run api & postgres in docker
- docker-compose up

  **which will run task api at localhost:5001**


# Task

### Model:
Task {
     Id,
     Title,
     Status,
     CreatedAt,
     UpdatedAt,
}

enum Status {
    'CREATED',
    'COMPLETED',
    'INPROGRESS',
    'CANCELLED'
}

### Endpoints:
1- GetAllTasks

**GET localhost:5001/tasks?page={page_num}&pageSize={size}**

2- GET Task by Id

**GET localhost:5001/tasks/{task_id}**

3- Create Task

**POST localhost:5001/tasks**
body: { "title": "task_1", "status": "CREATED" }

4- Delete Task

**DELETE localhost:5001/tasks/{task_id}**

5- Update Task

**PUT localhost:5001/tasks/{task_id}**
body: { "title": "task_1", "status": "COMPLETED" }


# TaskList

### Model:
TaskList 
{
   Id,
   Title,
   Status,
   Tasks: Task[],
   CreatedAt,
   UpdatedAt
}

### Endpoints:
1- GetAllTaskList 

**GET localhost:5001/task-list?page={page_num}&pageSize={size}**

2- GET TaskList by Id

**GET localhost:5001/task-list/{task_list_id}**

3- Create TaskList

**POST localhost:5001/task-list**
body: { "title": "task_list_1", "status": "CREATED" }

4- Delete TaskList

**DELETE localhost:5001/task-list/{task_list_id}**

5- Update TaskList

**PUT localhost:5001/task-list/{task_list_id}**
body: { "title": "task_list_1", "status": "COMPLETED" }

6- Add Task(s) to a TaskList

**POST localhost:5001/task-list/{task_list_id}/task**
body: { "task_ids": [ task_id1, task_id2 ] }

7- Remove Task(s) from a TaskList

**DELETE localhost:5001/task-list/{task_list_id}/task**
body: { "task_ids": [ task_id1, task_id2 ] }

# DB Schema
./src/db/init.sql
