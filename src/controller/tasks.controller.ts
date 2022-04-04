import { Request, Response, Router } from "express";
import { QueryResult } from "pg";

import Controller from "../interfaces/controller.interfaces";
import { pool } from "../db/db";
import logger from "../logger/logger";
import { Status } from "../model/status";

const NAMESPACE = 'Task Controller'

class TasksController implements Controller {
    public path = '/tasks';
    public router = Router();

    constructor() {
        this.initializeRoutes();        
    }

    initializeRoutes() {
        this.router.get(this.path, this.getTasks);
        this.router.get(`${this.path}/:id`, this.getTaskById);
        this.router.post(this.path, this.createTask);
        this.router.delete(`${this.path}/:id`, this.deleteTask);
        this.router.put(`${this.path}/:id`, this.updateTask);
    }
    
    private getTasks = async (req: Request, res: Response): Promise<Response> => {
        try {
            const pageSize = req.query.pageSize ? parseInt(req.query.pageSize.toString()) : 10;
            const page = req.query.page ? parseInt(req.query.page.toString()) : 1;
            if(page < 1) {
                return res.status(400).json(`Invalid page number:${page}, page number should be greater than or equal to 1.`);
            }
            
            const response: QueryResult =
                await pool.query('SELECT * FROM task LIMIT $1 OFFSET (($2 -1)* $1)', [pageSize, page]);
            return res.status(200).json(response.rows);
        } catch (error: any) {
            logger.error(NAMESPACE, error.message);
            return res.status(500).json('Internal server error');
        }
    }

    private getTaskById = async (req: Request, res: Response): Promise<Response> => {
        try {
            const id = parseInt(req.params.id);
            const response: QueryResult = await pool.query('SELECT * FROM task where id = $1', [id]);
            if(response.rowCount == 0) {
                return res.status(404).json(`Task id:${id} not found`);
            }
            return res.status(200).json(response.rows);
        } catch (error: any) {
            logger.error(NAMESPACE, error.message);
            return res.status(500).json('Internal server error');
        }
    }

    private createTask = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { title, status } = req.body;
            let [isValid, msg] = this.validate(title,status);
            if(!isValid) {
                return res.status(400).json(msg);
            }

            const response: QueryResult =
                await pool.query('INSERT INTO task (title, task_status) VALUES ($1, $2)',[title, status]);
            
            return res.status(201).json({
                message: `Task created successfully`,
                body: response.rows[0]
            });

        } catch (error: any) {
            if(error.message == 'duplicate key value violates unique constraint "task_title_key"'){
                return res.status(409).json(`Task with title:${req.body.title} already exists.`);
            }
            logger.error(NAMESPACE, error.message);
            return res.status(500).json('Internal server error');
        }
    }

    private updateTask = async (req: Request, res: Response): Promise<Response> => {
        try {
            const id = parseInt(req.params.id);
            const { title, status } = req.body;
            let [isValid, msg] = this.validate(title,status);
            if(!isValid) {
                return res.status(400).json(msg);
            }
            const response: QueryResult =
                await pool.query('UPDATE task SET title = $1, task_status = $2, updated_at = $3 WHERE id = $4',[title, status, new Date(), id]);
            
            if(response.rowCount == 0) {
                return res.status(404).json(`Task: ${id} not found`);
            }
            return res.status(201).json({
                message: 'Task updated successfully',
                body: response.rows[0]
            });

        } catch (error: any) {
            logger.error(NAMESPACE, error.message);
            return res.status(500).json('Internal server error');
        }
    }

    private deleteTask = async (req: Request, res: Response): Promise<Response> => {
        try {
            const id = parseInt(req.params.id);
            const result = await pool.query('DELETE FROM task where id = $1', [id]);

            if(result.rowCount == 0) {
                return res.status(404).json(`Task: ${id} not found`);
            }

            return res.status(200).json(`Task: ${id} deleted successfully`);
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

export default TasksController;

