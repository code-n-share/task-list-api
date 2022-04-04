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

describe('task', () => {
    let db:any;
    beforeEach(() => {
        db = new Pool();
    });
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('get task by Id', () => {
        describe('task does not exist ', () => {
            it("should return a 404", async () => {
                db.query.mockResolvedValue({ rows: [], rowCount: 0 });
                const task_id = 5000;
                await supertest(app).get(`/tasks/${task_id}`).expect(404);
            })
        });

        describe('task exist', () => {
            it("should return 200 with task", async () => {
                const task_id = 5000;
                const expectedTask = TestData.getTask(task_id);
                db.query.mockResolvedValue({ rows: [expectedTask], rowCount: 1 });
                const {body, statusCode } = await supertest(app).get(`/tasks/${task_id}`);
                expect(statusCode).toBe(200);
                expect(body[0].id).toBe(expectedTask.id);
                expect(body[0].title).toBe(expectedTask.title);
            })
        });
    });

    describe('get all task', () => {
        describe('no task in db', () => {
            it("should return 200 with empty list", async () => {
                db.query.mockResolvedValue({ rows: [], rowCount: 0 });
                const {body, statusCode } = await supertest(app).get(`/tasks`);
                expect(statusCode).toBe(200);
                expect(body).toEqual([]);
            })
        });

        describe('task exist in db', () => {
            it("should return 200 with list of tasks", async () => {
                const allTasks = TestData.getAllTask();
                db.query.mockResolvedValue({ rows: allTasks, rowCount: allTasks.length });
                const {body, statusCode } = await supertest(app).get(`/tasks`);
                expect(statusCode).toBe(200);
                expect(body.length).toBe(allTasks.length);
            })
        });
    });

    describe('create task', () => {
        describe('task id already exist', () => {
            it("should return 409", async () => {
                db.query.mockImplementation( () => {throw new Error('duplicate key value violates unique constraint "task_title_key"')});
                const { statusCode } = await supertest(app).post(`/tasks`).send(TestData.getTask(1));
                expect(statusCode).toBe(409);
            })
        });

        describe('task not exist in db', () => {
            it("should return 400 if task model is not valid", async () => {
                const task = TestData.getCreateTaskInvalidReq();
                db.query.mockResolvedValue({ rows: [task], rowCount: 1 });
                const { statusCode } = await supertest(app).post(`/tasks`).send(task);
                expect(statusCode).toBe(400);
            })

            it("should return 201 with task", async () => {
                const task = TestData.getCreateTaskReq();
                const expectedTask = {
                    id: 1,
                    title:task.title,
                    status: task.status,
                    created_at: new Date().toISOString()
                }
                db.query.mockResolvedValue({ rows: [expectedTask], rowCount: 1 });
                const { body, statusCode } = await supertest(app).post(`/tasks`).send(task);
                expect(statusCode).toBe(201);
                expect(body.message).toBe('Task created successfully');
                expect(body.body.id).toBe(expectedTask.id);
                expect(body.body.title).toBe(expectedTask.title);
                expect(body.body.created_at).not.toBeUndefined();
                expect(body.body.created_at).toBe(expectedTask.created_at);
            })
        });
    });

    describe('delete a task', () => {
        describe('task does not exist', () => {
            it("should return 404", async () => {
                db.query.mockResolvedValue({ rows: [], rowCount: 0 });
                const { statusCode } = await supertest(app).delete(`/tasks/1`);
                expect(statusCode).toBe(404);
            })
        });

        describe('task exist in db', () => {
            it("should return 200", async () => {
                db.query.mockResolvedValue({ rows: [], rowCount: 1 });
                const { statusCode } = await supertest(app).delete(`/tasks/1`);
                expect(statusCode).toBe(200);
            })
        });
    });

    describe('update a task', () => {
        describe('task dose not exist', () => {
            it("should return 404", async () => {
                db.query.mockResolvedValue({ rows: [], rowCount: 0 });
                const { statusCode } = await supertest(app).put(`/tasks/1`).send(TestData.getTask(1));
                expect(statusCode).toBe(404);
            })
        });

        describe('task exist in db', () => {
            it("should return 400 if update task model is not valid", async () => {
                const { statusCode } = await supertest(app).post(`/tasks`).send(TestData.getCreateTaskInvalidReq());
                expect(statusCode).toBe(400);
            })

            it("should return 201 with task", async () => {
                const task = TestData.getTask(1);
                const expectedTask = {
                    id: task.id,
                    title:task.title,
                    status: task.status,
                    created_at: task.created_at,
                    updated_at: new Date().toISOString()
                }
                db.query.mockResolvedValue({ rows: [expectedTask], rowCount: 1 });
                const { body, statusCode } = await supertest(app).put(`/tasks/${task.id}`).send(task);
                expect(statusCode).toBe(201);
                expect(body.message).toBe('Task updated successfully');
                expect(body.body.id).toBe(expectedTask.id);
                expect(body.body.title).toBe(expectedTask.title);
                expect(body.body.created_at).toBe(expectedTask.created_at);
                expect(body.body.updated_at).not.toBeUndefined();
                expect(body.body.updated_at).toBe(expectedTask.updated_at);
            })
        });
    });
});