import { auth } from "express-oauth2-jwt-bearer";
import 'dotenv/config';

export const jwtMiddleware = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_DOMAIN,
  tokenSigningAlg: 'RS256'
});