import axios from 'axios';

async function sendEmail({ name, toEmail, subject, message }) {
  const MJ_API_KEY = process.env.MJ_API_KEY;
  const MJ_API_SECRET = process.env.MJ_API_SECRET;
  const FROM_EMAIL = process.env.FROM_EMAIL;
  const TO_EMAILS = toEmail || process.env.TO_EMAILS;

  if (!MJ_API_KEY || !MJ_API_SECRET || !FROM_EMAIL || !TO_EMAILS) {
    throw new Error('Mailjet API credentials or emails not configured properly.');
  }

  // Handle multiple emails
  const recipients = TO_EMAILS.split(',').map(email => ({
    Email: email.trim(),
    Name: 'Admin',
  }));  

  const finalSubject = subject || (name ? `New Contact Form Submission from ${name}` : 'New Email');
  const finalTextPart = message || 'No message provided.';
  
  const payload = {
    Messages: [
      {
        From: {
          Email: FROM_EMAIL,
          Name: 'Md Faruk Khan SEO',
        },
        To: [{ Email: 'noreply@mdfarukkhan.com', Name: 'No Reply' }],
        Bcc: recipients,
        Subject: finalSubject,
        TextPart: finalTextPart,
        CustomID: 'UniversalEmail',
      },
    ],
  };

  const response = await axios.post('https://api.mailjet.com/v3.1/send', payload, {
    auth: {
      username: MJ_API_KEY,
      password: MJ_API_SECRET,
    },
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return response.data;
}

export default sendEmail;
