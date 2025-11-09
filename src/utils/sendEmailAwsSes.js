const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");
require('dotenv').config();

const ses = new SESClient({ region: "ap-south-1", credentials:{
    accessKeyId:process.env.AWS_IAM_ACCESS_KEY,
    secretAccessKey:process.env.AWS_IAM_SECRET_ACCESS_KEY
} });

const setEmailParams = (senderEmail, recipientEmail, emailSubject, htmlEmailBody="", plainEmailBody="")=>{
    return {
        Source: senderEmail,
        Destination: {
            ToAddresses: [recipientEmail],
        },
        Message: {
            Subject: {
                Charset: "UTF-8",
                Data: emailSubject,
            },
            Body: {
                Html: {
                    Charset: "UTF-8",
                    Data: htmlEmailBody,
                },
                Text: {
                    Charset: "UTF-8",
                    Data: plainEmailBody,
                },
            },
        },
    };
}

const sendEmail = async(senderEmail, recipientEmail, emailSubject, htmlEmailBody, plainEmailBody)=>{
    try {
        const params = setEmailParams(senderEmail, recipientEmail, emailSubject, htmlEmailBody, plainEmailBody);
        const command = new SendEmailCommand(params);
        await ses.send(command);
        console.log("Email send successfully:");
    } catch (error) {
        console.error("Error sending email:", error);
    }
}

module.exports = sendEmail;