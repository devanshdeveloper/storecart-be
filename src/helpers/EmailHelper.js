const nodemailer = require("nodemailer");
const sendinblueTransport = require("nodemailer-sendinblue-transport");

class EmailHelper {
  constructor(options = {}) {
    this.apiKey = options.apiKey || process.env.SENDINBLUE_API_KEY;
    this.defaultSender =
      options.defaultSender ||
      process.env.DEFAULT_SENDER_EMAIL ||
      "noreply@Storecart.com";
    // this.defaultSender = options.defaultSender || {
    //   email: process.env.DEFAULT_SENDER_EMAIL || 'noreply@Storecart.com',
    //   name: process.env.DEFAULT_SENDER_NAME || 'Storecart'
    // };

    // Initialize Nodemailer with Sendinblue transport
    this.transporter = nodemailer.createTransport(
      new sendinblueTransport({
        apiKey: this.apiKey,
      })
    );
  }

  /**
   * Send a transactional email
   * @param {Object} options Email options
   * @returns {Promise}
   */
  async sendEmail(options) {
    try {
      const mailOptions = {
        from: options.sender || this.defaultSender,
        to: Array.isArray(options.to) ? options.to.join(",") : options.to,
        subject: options.subject,
        html: options.htmlContent,
        text: options.textContent,
      };

      if (options.cc) {
        mailOptions.cc = Array.isArray(options.cc)
          ? options.cc.join(",")
          : options.cc;
      }

      if (options.bcc) {
        mailOptions.bcc = Array.isArray(options.bcc)
          ? options.bcc.join(",")
          : options.bcc;
      }

      if (options.attachments) {
        mailOptions.attachments = options.attachments;
      }

      const result = await this.transporter.sendMail(mailOptions);
      return result;
    } catch (error) {
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }
}

module.exports = EmailHelper;

/* Usage Examples:

// Initialize EmailHelper
const emailHelper = new EmailHelper({
  apiKey: process.env.BREVO_API_KEY,
  defaultSender: {
    email: 'noreply@Storecart.com',
    name: 'Storecart'
  }
});

// Send a simple email
const emailResult = await emailHelper.sendEmail({
  to: 'user@example.com',
  subject: 'Welcome to Storecart',
  htmlContent: '<h1>Welcome!</h1><p>Thank you for joining Storecart.</p>',
  textContent: 'Welcome! Thank you for joining Storecart.'
});

// Send email with CC and BCC
const emailWithCcBcc = await emailHelper.sendEmail({
  to: ['primary@example.com'],
  cc: ['cc1@example.com', 'cc2@example.com'],
  bcc: ['bcc@example.com'],
  subject: 'Team Update',
  htmlContent: '<p>Monthly team update...</p>'
});

// Create an email template
const template = await emailHelper.createTemplate({
  name: 'Welcome Email',
  subject: 'Welcome to {{company_name}}',
  htmlContent: '<h1>Welcome {{name}}!</h1><p>Thank you for joining {{company_name}}.</p>'
});

// Send email using template
const templateEmail = await emailHelper.sendEmail({
  to: 'user@example.com',
  templateId: template.id,
  params: {
    name: 'John Doe',
    company_name: 'Storecart'
  }
});

// Template Management
// 1. Get all templates
const allTemplates = await emailHelper.getAllTemplates();

// 2. Get specific template
const templateDetails = await emailHelper.getTemplate(templateId);

// 3. Update template
await emailHelper.updateTemplate(templateId, {
  name: 'Updated Welcome Email',
  subject: 'Welcome to Our Platform',
  htmlContent: '<h1>Welcome!</h1><p>Updated content...</p>'
});

// 4. Delete template
await emailHelper.deleteTemplate(templateId);
*/
