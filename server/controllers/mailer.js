import nodemailer from 'nodemailer';
import Mailgen from 'mailgen';
import ENV from '../config.js';

// SMTP configuration for Gmail
let smtpConfig = {
    service: 'gmail',
    auth: {
        user: ENV.EMAIL, // Your Gmail address
        pass: ENV.PASSWORD, // Your Gmail password
    },
};

// Create a nodemailer transporter using the SMTP configuration
let transporter = nodemailer.createTransport(smtpConfig);

let MailGenerator = new Mailgen({
    theme: 'default',
    product: {
        name: 'ExploreEase',
        link: 'https://mailgen.js/',
    },
});

// Function to send registration email
export const registerMail = async (req, res) => {
    const { username, userEmail, text, subject } = req.body;

    // Email content
    let email = {
        body: {
            name: username,
            intro: text || "Welcome to Explore Ease! We're very excited to have you on board.",
            outro: "Need help, or have questions? Just reply to this email, we'd love to help.",
        },
    };

    // Generate HTML content for the email
    let emailBody = MailGenerator.generate(email);

    // Message configuration
    let message = {
        from: ENV.EMAIL, // Sender's email address (your Gmail address)
        to: userEmail, // Recipient's email address
        subject: subject || 'Signup Successful', // Email subject
        html: emailBody, // HTML content for the email
    };

    try {
        // Send email
        await transporter.sendMail(message);
        return res.status(200).send({ msg: 'Email sent successfully.' });
    } catch (error) {
        console.error('Error sending email:', error);
        return res.status(500).send({ error: 'Failed to send email.' });
    }
};
