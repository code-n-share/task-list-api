import supertest from 'supertest';
import { Pool  } from 'pg';

import createServer from '../util/server'
import TestData from './testdata'

const app = createServer();

jest.mock('pg', () => {
    const mockPool = {
      connect: jest.fn(),
      query: jest.fn(),
      end: jest.fn(),
    };
    return { Pool : jest.fn(() => mockPool) };
  });

describe('task list', () => {
    let db:any;
    beforeEach(() => {
        db = new Pool();
    });
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('get task list by Id', () => {
        describe('task list does not exist ', () => {
            it("should return a 404", async () => {
                db.query.mockResolvedValue({ rows: [], rowCount: 0 });
                const task_list_id = 5000;
                await supertest(app).get(`/task-list/${task_list_id}`).expect(404);
            })
        });

        describe('task list exist', () => {
            it("should return 200 with task list", async () => {
                const task_list_id = 5000;
                const expectedTask = TestData.getTaskList(task_list_id);
                db.query.mockResolvedValue({ rows: [expectedTask], rowCount: 1 });
                const {body, statusCode } = await supertest(app).get(`/task-list/${task_list_id}`);
                expect(statusCode).toBe(200);
                expect(body[0].id).toBe(expectedTask.id);
                expect(body[0].title).toBe(expectedTask.title);
            })
        });
    });

    describe('get all task list', () => {
        describe('no task list in db', () => {
            it("should return 200 with empty list", async () => {
                db.query.mockResolvedValue({ rows: [], rowCount: 0 });
                const {body, statusCode } = await supertest(app).get(`/task-list`);
                expect(statusCode).toBe(200);
                expect(body).toEqual([]);
            })
        });

        describe('task list exist in db', () => {
            it("should return 200 with list of task list", async () => {
                const allTaskList = TestData.getAllTaskList();
                db.query.mockResolvedValue({ rows: allTaskList, rowCount: allTaskList.length });
                const {body, statusCode } = await supertest(app).get(`/task-list`);
                expect(statusCode).toBe(200);
                expect(body.length).toBe(allTaskList.length);
            })
        });
    });

    describe('create a task list', () => {
        describe('task list id already exist', () => {
            it("should return 409", async () => {
                db.query.mockImplementation( () => {throw new Error('duplicate key value violates unique constraint "task_title_key"')});
                const { statusCode } = await supertest(app).post(`/task-list`).send(TestData.getTaskList(1));
                expect(statusCode).toBe(409);
            })
        });

        describe('task list not exist in db', () => {
            it("should return 400 if task list model is not valid", async () => {
                const tasklist = TestData.getCreateTaskListInvalidReq();
                const { statusCode } = await supertest(app).post(`/task-list`).send(tasklist);
                expect(statusCode).toBe(400);
            })

            it("should return 201 with task", async () => {
                const task_list = TestData.getCreateTaskListReq();
                const expectedTask = {
                    id: 1,
                    title:task_list.title,
                    status: task_list.status,
                    created_at: new Date().toISOString()
                }
                db.query.mockResolvedValue({ rows: [expectedTask], rowCount: 1 });
                const { body, statusCode } = await supertest(app).post(`/task-list`).send(task_list);
                expect(statusCode).toBe(201);
                expect(body.message).toBe('TaskList created successfully');
                expect(body.body.id).toBe(expectedTask.id);
                expect(body.body.title).toBe(expectedTask.title);
                expect(body.body.created_at).not.toBeUndefined();
                expect(body.body.created_at).toBe(expectedTask.created_at);
            })
        });
    });

    describe('delete a task list', () => {
        describe('task list does not exist', () => {
            it("should return 404", async () => {
                db.query.mockResolvedValue({ rows: [], rowCount: 0 });
                const { statusCode } = await supertest(app).delete(`/task-list/1`);
                expect(statusCode).toBe(404);
            })
        });

        describe('task list exist in db', () => {
            it("should return 200", async () => {
                db.query.mockResolvedValue({ rows: [], rowCount: 1 });
                const { statusCode } = await supertest(app).delete(`/task-list/1`);
                expect(statusCode).toBe(200);
            })
        });
    });

    describe('update a task list', () => {
        describe('task list dose not exist', () => {
            it("should return 404", async () => {
                db.query.mockResolvedValue({ rows: [], rowCount: 0 });
                const { statusCode } = await supertest(app).put(`/task-list/1`).send(TestData.getTaskList(1));
                expect(statusCode).toBe(404);
            })
        });

        describe('task list exist in db', () => {
            it("should return 400 if update task list model is not valid", async () => {
                const { statusCode } = await supertest(app).post(`/task-list`).send(TestData.getCreateTaskListInvalidReq());
                expect(statusCode).toBe(400);
            })

            it("should return 201 with task list", async () => {
                const taskList = TestData.getTaskList(1);
                const expectedTaskList = {
                    id: taskList.id,
                    title:taskList.title,
                    status: taskList.status,
                    created_at: taskList.created_at,
                    updated_at: new Date().toISOString()
                }
                db.query.mockResolvedValue({ rows: [expectedTaskList], rowCount: 1 });
                const { body, statusCode } = await supertest(app).put(`/task-list/${taskList.id}`).send(taskList);
                expect(statusCode).toBe(201);
                expect(body.message).toBe('TaskList updated successfully');
                expect(body.body.id).toBe(expectedTaskList.id);
                expect(body.body.title).toBe(expectedTaskList.title);
                expect(body.body.created_at).toBe(expectedTaskList.created_at);
                expect(body.body.updated_at).not.toBeUndefined();
                expect(body.body.updated_at).toBe(expectedTaskList.updated_at);
            })
        });
    });

    describe('add a task to task list', () => {
        describe('task list does not exist', () => {
            it("should return 404", async () => {
                db.query.mockImplementation( () => {throw new Error('insert or update on table "task_list_mapping" violates foreign key constraint "task_list_mapping_task_list_id_fkey"')});
                const { statusCode } = await supertest(app).post(`/task-list/1/task`).send({ "task_ids": [1]});
                expect(statusCode).toBe(404);
            })
        });

        describe('task does not exist', () => {
            it("should return 404", async () => {
                db.query.mockImplementation( () => {throw new Error('insert or update on table "task_list_mapping" violates foreign key constraint "task_list_mapping_task_id_fkey"')});
                const { statusCode } = await supertest(app).post(`/task-list/1/task`).send({ "task_ids": [1]});
                expect(statusCode).toBe(404);
            })
        });

        describe('task is already added to task list', () => {
            it("should return 409", async () => {
                db.query.mockImplementation( () => {throw new Error('duplicate key value violates unique constraint "task_list_mapping_pkey"')});
                const { statusCode } = await supertest(app).post(`/task-list/1/task`).send({ "task_ids": [1]});
                expect(statusCode).toBe(409);
            })
        });

        describe('task added successfully', () => {
            it("should return 200", async () => {
                db.query.mockResolvedValue({ rows: [2], rowCount: 2 });
                const { statusCode } = await supertest(app).post(`/task-list/1/task`).send({ "task_ids": [1]});
                expect(statusCode).toBe(201);
            })
        });
    });
});