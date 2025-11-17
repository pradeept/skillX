import { Request } from "express";

// extend Request to include data and notify 
declare global {
  namespace Express {
    interface Request {
      data?: any;
      notify?: any;
    }
  }
}
