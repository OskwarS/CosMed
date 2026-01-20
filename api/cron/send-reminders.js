
import { neon } from '@neondatabase/serverless';
import { sendAppointmentReminder } from '../../src/services/emailService.js';

export default async function handler(request, response) {
    // Basic security for Cron jobs (optional but recommended to check header)
    // Vercel Cron sets 'authorization' header if configured with CRON_SECRET, 
    // or checks strictly if traffic comes from Vercel Cron IP.
    // For open endpoint (like verify) we might skip strict check or use a secret query param if needed.

    // Allow manual trigger for testing via GET
    if (request.method !== 'GET') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    const sql = neon(process.env.DATABASE_URL);

    try {
        // Find appointments for TODAY
        // PostgreSQL: CURRENT_DATE compares strictly the date part
        const appointments = await sql`
            SELECT 
                a.id, 
                a.date, 
                p.first_name, 
                p.last_name, 
                p.contact as email, 
                d.first_name as doctor_first_name, 
                d.last_name as doctor_last_name
            FROM appointments a
            JOIN patients p ON a.patient_id = p.id
            JOIN doctors d ON a.doctor_id = d.id
            WHERE a.date::date = CURRENT_DATE
            AND a.status != 'Anulowana'
        `;

        if (appointments.length === 0) {
            return response.status(200).json({ message: 'No appointments today.' });
        }

        const results = [];

        for (const appt of appointments) {
            if (!appt.email || !appt.email.includes('@')) {
                results.push({ id: appt.id, status: 'skipped (invalid email)' });
                continue;
            }

            const dateObj = new Date(appt.date);
            const formattedTime = dateObj.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });

            const result = await sendAppointmentReminder(
                appt.email,
                `${appt.first_name} ${appt.last_name}`,
                {
                    time: formattedTime,
                    doctorName: `${appt.doctor_first_name} ${appt.doctor_last_name}`
                }
            );

            results.push({ id: appt.id, email: appt.email, status: result.success ? 'sent' : 'failed' });
        }

        return response.status(200).json({
            message: `Processed ${appointments.length} appointments`,
            details: results
        });

    } catch (error) {
        console.error('Cron job error:', error);
        return response.status(500).json({ error: error.message });
    }
}
