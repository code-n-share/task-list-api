import {Request, Response, Router} from 'express';
import Controller from 'interfaces/controller.interfaces';
import { QueryResult } from 'pg';
import format from 'pg-format';

import { pool } from "../db/db";
import logger from "../logger/logger";
import { Status } from "../model/status";

const NAMESPACE = 'TaskList Controller'

class TaskListController implements Controller {
    public path = "/task-list";
    public router = Router();

    constructor() {
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.get(this.path, this.getTaskLists);
        this.router.get(`${this.path}/:id`, this.getTaskListById);
        this.router.post(this.path, this.createTaskList);
        this.router.put(`${this.path}/:id`, this.updateTaskList);
        this.router.delete(`${this.path}/:id`, this.deleteTaskList);
        this.router.post(`${this.path}/:id/task`, this.addTasksToTaskList);
        this.router.delete(`${this.path}/:id/task`, this.removeTasksFromTaskList);
    }

    private getTaskLists = async (req: Request, res: Response): Promise<Response> => {
        try {
            const pageSize = req.query.pageSize ? parseInt(req.query.pageSize.toString()) : 10;
            const page = req.query.page ? parseInt(req.query.page.toString()) : 1;
            if(page < 1) {
                return res.status(400).json(`Invalid page number:${page}, page number should be greater than or equal to 1.`);
            }

            const response: QueryResult =
                await pool.query(`SELECT
                        tl.id,
                        tl.title,
                        tl.task_list_status,
                        tl.created_at,
                        tl.updated_at,
                        coalesce(
                        (
                            SELECT array_to_json(array_agg(row_to_json(x)))
                            FROM (
                            SELECT t.id, t.title, t.task_status, t.created_at, t.updated_at
                            FROM task_list_mapping tlm
                            LEFT OUTER JOIN task t on t.id = tlm.task_id
                            WHERE tlm.task_list_id = tl.id
                            ) x
                        ),
                        '[]'
                        ) AS tasks
                    FROM task_list tl LIMIT $1 OFFSET (($2 -1)* $1)`, [pageSize, page]);
            
            return res.status(200).json(response.rows);
        } catch (error: any) {
            logger.error(NAMESPACE, error.message);
            return res.status(500).json('Internal server error');
        }
    }

    private getTaskListById = async (req: Request, res: Response): Promise<Response> => {
        try {
            const id = parseInt(req.params.id);
            const response: QueryResult =
                await pool.query(`SELECT
                        tl.id,
                        tl.title,
                        tl.task_list_status,
                        tl.created_at,
                        tl.updated_at,
                        coalesce(
                        (
                            SELECT array_to_json(array_agg(row_to_json(x)))
                            FROM (
                            SELECT t.id, t.title, t.task_status, t.created_at, t.updated_at
                            FROM task_list_mapping tlm
                            LEFT OUTER JOIN task t on t.id = tlm.task_id
                            WHERE tlm.task_list_id = tl.id
                            ) x
                        ),
                        '[]'
                        ) AS tasks
                    FROM task_list tl WHERE tl.id = $1`, [id]);
            if(response.rowCount == 0) {
                return res.status(404).json(`TaskList id:${id} not found`);
            }
            return res.status(200).json(response.rows);
        } catch (error: any) {
            logger.error(NAMESPACE, error.message);
            return res.status(500).json('Internal server error');
        }
    }

    private createTaskList = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { title, status } = req.body;
            let [isValid, msg] = this.validate(title,status);
            if(!isValid) {
                return res.status(400).json(msg);
            }

            const response: QueryResult =
                await pool.query('INSERT INTO task_list (title, task_list_status) VALUES ($1, $2)',[title, status]);
            
            return res.status(201).json({
                message: 'TaskList created successfully',
                body: response.rows[0]
            });

        } catch (error: any) {
            if(error.message == 'duplicate key value violates unique constraint "task_title_key"'){
                return res.status(409).json(`TaskList with title:${req.body.title} already exists.`);
            }
            logger.error(NAMESPACE, error.message);
            return res.status(500).json('Internal server error');
        }
    }

    private updateTaskList = async (req: Request, res: Response): Promise<Response> => {
        try {
            const id = parseInt(req.params.id);
            const { title, status } = req.body;
            let [isValid, msg] = this.validate(title,status);
            if(!isValid) {
                return res.status(400).json(msg);
            }
            const response: QueryResult =
                await pool.query('UPDATE task_list SET title = $1, task_list_status = $2, updated_at = $3 WHERE id = $4',[title, status, new Date(), id]);
            
            if(response.rowCount == 0) {
                return res.status(404).json(`TaskList: ${id} not found`);
            }
            return res.status(201).json({
                message: 'TaskList updated successfully',
                body: response.rows[0]
            });

        } catch (error: any) {
            logger.error(NAMESPACE, error.message);
            return res.status(500).json('Internal server error');
        }
    }

    private deleteTaskList = async (req: Request, res: Response): Promise<Response> => {
        try {
            const id = parseInt(req.params.id);
            const result = await pool.query('DELETE FROM task_list where id = $1', [id]);

            if(result.rowCount == 0) {
                return res.status(404).json(`TaskList: ${id} not found`);
            }

            return res.status(200).json(`TaskList: ${id} deleted successfully`);
        } catch (error: any) {
            logger.error(NAMESPACE, error.message);
            return res.status(500).json('Internal server error');
        }
    }

    private addTasksToTaskList = async (req: Request, res: Response): Promise<Response> => {
        try {
            const id = parseInt(req.params.id);
            const { task_ids } = req.body;
            const values = (task_ids as number[]).map(task_id => [id, task_id] );

            const res1 = await pool.query(
                    format(`
                        INSERT INTO task_list_mapping (task_list_id, task_id) VALUES %L;
                        UPDATE task_list SET updated_at = %L WHERE id = %s;
                        `, values, new Date(), id));
            console.log(res1);
            return res.status(201).json('Tasks added to TaskList successfully');

        } catch (error: any) {
            if(error.message == 'duplicate key value violates unique constraint "task_list_mapping_pkey"'){
                return res.status(409).json(error.detail);
            }

            if(error.message == 'insert or update on table "task_list_mapping" violates foreign key constraint "task_list_mapping_task_list_id_fkey"'){
                return res.status(404).json(`TaskList:${req.params.id} not found`);
            }
            
            if(error.message == 'insert or update on table "task_list_mapping" violates foreign key constraint "task_list_mapping_task_id_fkey"'){
                return res.status(404).json(error.detail);
            }

            logger.error(NAMESPACE, error.message);
            return res.status(500).json('Internal server error');
        }
    }

    private removeTasksFromTaskList = async (req: Request, res: Response): Promise<Response> => {
        try {
            const id = parseInt(req.params.id);
            const { task_ids } = req.body;
            const values = task_ids as number[];
            
            await pool.query(format(`
                DELETE FROM task_list_mapping WHERE task_id IN (%s) and task_list_id = %s;
                UPDATE task_list SET updated_at = %L WHERE id = %s;
            `, values, id, new Date(), id));

            return res.status(201).json('Tasks deleted successfully from the TaskList');

        } catch (error: any) {
            logger.error(NAMESPACE, error.message);
            return res.status(500).json('Internal server error');
        }
    }

    validate(title:string, status:any){
        if(!title)return [false,`Title is empty`];
        if(Status[status] == undefined )return [false,`Invalid status:${status}`];
        return [true, '']
    }
}

export default TaskListController;


