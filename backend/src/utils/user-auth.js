const path = require('path');
const crypto = require('crypto');
require("dotenv").config({ path: path.join(__dirname, "../../.env.local") });
const { createClient } = require("@supabase/supabase-js");
const NodeCache = require('node-cache');
const cache = new NodeCache();
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_KEY);

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

const triggerResetEmail = async (email) => {

    try {
        const { data, error } = await supabase
            .from("auth")
            .select("email")
            .eq("email", email);

        if (error || !data || data.length <= 0 || !data[0].email) {
            return null;
        }

        // prepare token
        let token = '';
        const tokenAlreadyExists = cache.get(email);
        token = tokenAlreadyExists ? tokenAlreadyExists : crypto.randomBytes(16).toString('hex');
        cache.set(email, token, 300);
        const link = `${process.env.FRONTEND_URL}/auth/signin?token=${token}&email=${email}`;

        // trigger email
        const sent = await resend.emails.send({
            from: `${process.env.RESEND_EMAIL}`,
            to: [`${email}`],
            subject: 'Reset Password For Stats',
            html: `<div style="max-width: 600px; margin: 20px auto; padding: 20px; background-color: #ffffff; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
            <header style="text-align: center;">
                <h1 style="color: #1a5276;">Stats</h1>
            </header>
            <div>
                <p style="color: #34495e; line-height: 1.6;">Hello,</p>
                <p style="color: #34495e; line-height: 1.6;">We received a request to reset your password for the Stats project. Please click the button below to reset your password:</p>
                <p style="text-align: center;"><a href=${link} style="display: inline-block; background-color: #3498db; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 5px;">Reset Password</a></p>
                <p style="color: #34495e; line-height: 1.6;">If you did not request a password reset, you can safely ignore this email. Your account's security is important to us.</p>
            </div>
            <footer style="text-align: center; margin-top: 20px;">
                <p style="color: #555555;">For any inquiries, contact us at <a href="mailto:contact@stats.holdings" style="color: #3498db; text-decoration: none;">contact@stats.holdings</a></p>
            </footer>
                </div>`
        });

        return sent;
    } catch (e) { return null; }
};

const hashString = (input) => {
    try {

        const algorithm = 'sha256';

        const hash = crypto.createHash(algorithm);

        hash.update(input);

        const hashedString = hash.digest('hex');

        return hashedString;
    } catch (e) {
        return null;
    }
}

const verifyToken = (email, token) => {
    try {
        const savedToken = cache.get(email);
        return savedToken === token;
    } catch (e) {
        return false;
    }
}

const updatePassword = async (email, hashedPassword) => {
    try {
        return email && hashedPassword ? await supabase
            .from("auth")
            .update({ password: hashedPassword })
            .eq("email", email) : null;
    } catch (e) {
        return null;
    }
}

module.exports = { triggerResetEmail, hashString, verifyToken, updatePassword }
