import { Request, Response, NextFunction, Router } from "express";
import Controller from "../interfaces/controller.interfaces";


class HealthCheckController implements Controller {
    public path = '/health';
    public router = Router();

    constructor() {
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.get(this.path, this.healthCheck);
    }

    private healthCheck = (req: Request, res:Response, next: NextFunction) => {
        return res.sendStatus(200);
    };
}

export default HealthCheckController;