import { Request, Response, NextFunction } from 'express';

declare global {
    namespace Express {
        interface Request {
            user?: any; // Adiciona a propriedade 'user' ao tipo 'Request'
        }
    }
}
import jwt from 'jsonwebtoken';

const secretKey = 'teste'; // Substitua pela sua chave secreta

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Obtém o token do cabeçalho

    if (!token) {
        return res.status(401).json({ message: 'Token não fornecido' });
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Token inválido' });
        }

        req.user = decoded; // Armazena os dados do usuário decodificados na requisição
        next(); // Chama o próximo middleware
    });
};