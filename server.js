
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import dotenv from 'dotenv'; // Render might need this if we want to support .env locally

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Adding Cron endpoint
app.get('/api/cron/send-reminders', async (req, res) => {
    const handler = await importHandler('./api/cron/send-reminders.js');
    await handler(req, res);
});

app.use(cors());

// WAŻNE: W Vercel (zależnie od ustawień) body czasem jest stringiem, czasem obiektem.
// Express z express.json() zawsze da obiekt.
// Aby API działało tak samo, dodajemy middleware parsujący JSON.
app.use(express.json());

// Obsługa plików statycznych (frontendu)
app.use(express.static(join(__dirname, 'dist')));

// Helper do importowania handlerów
const importHandler = async (path) => {
    try {
        const module = await import(path);
        return module.default;
    } catch (err) {
        console.error(`Failed to import handler at ${path}:`, err);
        return (req, res) => res.status(500).json({ error: 'Handler not found' });
    }
};

// Mapowanie ruterów API
// Musimy ręcznie podpiąć każdy plik z folderu api/

// Auth
app.post('/api/login', async (req, res) => {
    const handler = await importHandler('./api/login.js');
    await handler(req, res);
});

app.post('/api/register', async (req, res) => {
    const handler = await importHandler('./api/register.js');
    await handler(req, res);
});

// Doctors
app.get('/api/doctors', async (req, res) => {
    const handler = await importHandler('./api/doctors/index.js');
    await handler(req, res);
});
app.get('/api/doctors/index', async (req, res) => {
    const handler = await importHandler('./api/doctors/index.js');
    await handler(req, res);
});
app.get('/api/doctors/get-doctor', async (req, res) => {
    const handler = await importHandler('./api/doctors/get-doctor.js');
    await handler(req, res);
});
app.get('/api/doctors/:id', async (req, res) => {
    // Note: Vercel [id].js usually puts the params in req.query when using logic like this, 
    // but here we are manual. Let's start with simple import.
    // However, the handler likely expects `request.query.id`.
    req.query.id = req.params.id;
    const handler = await importHandler('./api/doctors/[id].js');
    await handler(req, res);
});


// Patients
app.get('/api/patients', async (req, res) => {
    const handler = await importHandler('./api/patients/index.js');
    await handler(req, res);
});
app.get('/api/patients/index', async (req, res) => {
    const handler = await importHandler('./api/patients/index.js');
    await handler(req, res);
});
app.get('/api/patients/get-patient', async (req, res) => {
    const handler = await importHandler('./api/patients/get-patient.js');
    await handler(req, res);
});
app.delete('/api/patients/:id', async (req, res) => {
    req.query.id = req.params.id;
    const handler = await importHandler('./api/patients/[id].js');
    await handler(req, res);
});


// Appointments
app.use('/api/appointments', async (req, res) => {
    const handler = await importHandler('./api/appointments/index.js');
    await handler(req, res);
});

// Availability
app.post('/api/availability', async (req, res) => {
    const handler = await importHandler('./api/availability/index.js');
    await handler(req, res);
});
app.get('/api/availability/:id', async (req, res) => {
    req.query.id = req.params.id; // Map Express param to Vercel-style query param
    const handler = await importHandler('./api/availability/[id].js');
    await handler(req, res);
});

// Medications
app.use('/api/medications', async (req, res) => {
    const handler = await importHandler('./api/medications/index.js');
    await handler(req, res);
});

// Medical History
app.use('/api/medical-history', async (req, res) => {
    const handler = await importHandler('./api/medical-history/index.js');
    await handler(req, res);
});


// Catch-all dla SPA (musi być na końcu)
app.get('*', (req, res) => {
    res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
