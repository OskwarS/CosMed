
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const sendAppointmentReminder = async (email, patientName, appointmentData) => {
    try {
        const info = await transporter.sendMail({
            from: `"${process.env.SMTP_SENDER_NAME || 'System Medyczny'}" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Przypomnienie o wizycie - System Medyczny',
            text: `Dzień dobry ${patientName},\n\nPrzypominamy o dzisiejszej wizycie zaplanowanej na godzinę ${appointmentData.time}.\n\nPozdrawiamy,\nTwoja Przychodnia`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                    <h2 style="color: #2c3e50;">Przypomnienie o wizycie</h2>
                    <p>Dzień dobry <strong>${patientName}</strong>,</p>
                    <p>Przypominamy o Twojej dzisiejszej wizycie.</p>
                    <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #3498db; margin: 20px 0;">
                        <p style="margin: 5px 0;"><strong>Godzina:</strong> ${appointmentData.time}</p>
                        <p style="margin: 5px 0;"><strong>Lekarz:</strong> ${appointmentData.doctorName}</p>
                    </div>
                    <p>Prosimy o punktualne przybycie.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;">
                    <p style="font-size: 12px; color: #7f8c8d;">Wiadomość wygenerowana automatycznie. Prosimy nie odpowiadać na tego maila.</p>
                </div>
            `,
        });

        console.log("Message sent: %s", info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("Error sending email:", error);
        return { success: false, error: error.message };
    }
};
