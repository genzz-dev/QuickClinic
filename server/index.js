import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import express from 'express';
import cors from 'cors';
import doctorRoutes from './Routes/doctorRoutes.js';
import patientRoutes from './Routes/patientRoutes.js';
import adminRoutes from './Routes/adminRoutes.js';
import connectDB from './config/db.js';
import authRoutes from './Routes/authRoutes.js';
import { config } from  './config/token.js'
import cookieParser from 'cookie-parser';

const app = express();

const PORT = process.env.PORT ;
app.use(express.json());
app.use(cookieParser());
// CORS config
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
connectDB();
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/admin', adminRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});