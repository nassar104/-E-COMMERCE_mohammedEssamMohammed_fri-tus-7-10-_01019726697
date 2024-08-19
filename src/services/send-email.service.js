import nodemailer from "nodemailer";

export const sendEmailService = async ({
  to,
  subject = "No Reply",
  textMessage = "",
  htmlMessage = "",
  attachments = [],
} = {}) => {
  const transporter = nodemailer.createTransport({
    host: "localhost", 
    port: 465,
    secure: true,
    auth: {
      user: "nssar104@gmail.com", 
      pass: "lpobplgajvexewzn", 
    },
  });
  // configer message ( mail )
  const info = await transporter.sendMail({
    from: "No Reply <mohammed.essam@eCommerce.com>",
    to,
    subject,
    text: textMessage,
    html: htmlMessage,
    attachments,
  });
  
  return info;
};
