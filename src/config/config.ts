import dotenv from 'dotenv';

dotenv.config();// reads .env file and makes it accessible via process.env

const HOST = process.env.HOST || 'localhost'
const PORT = (process.env.PORT || 5000) as number;

const config = {
    port: PORT,
    host: HOST
}

export default config;