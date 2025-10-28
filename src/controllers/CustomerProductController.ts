import { customerProductService } from "../utils/serviceLocator";
import { Request, Response } from 'express';


export class CustomerProductController {
    async getCustomerProducts(req: Request, res: Response): Promise<void> {
        try {
          const result = await customerProductService.getAllCustomerProducts();
          
      res.json({
          status: "success",
          statusCode: res.statusCode,
          data: result
      });
        } catch (e: any) {
            res.json({
                status: "error",
                statusCode: res.statusCode,
                error: {
                message: e.message,
                path: req.originalUrl,
                timeStamp: Date.now()
                }
            });
        }
      }
}