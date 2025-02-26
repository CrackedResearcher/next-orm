import { sign, verify } from "hono/jwt";
import { Context, Next } from "hono";

type JwtResPayload = {
    id: string;
    email: string;
    name: string;
    exp: number;
}

export const signJwt = async (payload: { id: string, email: string, name: string }) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET environment variable is not set");
    }
    const tokenPayload = {
        ...payload,
        exp: Math.floor(Date.now() / 1000) + ( 30 * 60 )
    }
    const token = await sign(tokenPayload, secret);
    return token;
}

export const verifyJwt = async (payload: { token: string } ) => {
    const secret = process.env.JWT_SECRET;
    if(!secret){
        throw new Error("JWT_SECRET is missing")
    }
    const check = await verify(payload.token, secret);
    return check;
}


export const authMiddleware = async (c: Context, next: Next) => {
    try {
        const authHeader = c.req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return c.json({ error: 'No token provided' }, 401);
        }

        const token = authHeader.split(' ')[1];
        const decoded = await verifyJwt({ token }) as JwtResPayload;
        
        c.set('userid', decoded.id);
        await next();
    } catch (error) {
        return c.json({ error: 'Invalid token' }, 401);
    }
}