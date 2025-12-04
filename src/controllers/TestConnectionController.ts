import express, {Request, Response} from "express";
import { request } from "http";

const router = express.Router();

router.get("/test-connection", (req:Request, res:Response)=>{
    res.status(200).json({message: "Conexão realizada com sucesso"})
})

export default router