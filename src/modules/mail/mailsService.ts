import nodemailer, { SentMessageInfo } from 'nodemailer'
import Mail from 'nodemailer/lib/mailer'
import { config } from '../../config'
import logger from '../../winston'

export default class MailsService {
    transporter: Mail<SentMessageInfo>

    constructor() {
        this.initNodemailer()
    }

    private initNodemailer(): void {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: config.emailUsername,
                pass: config.emailPassword,
            },
        })
    }

    public async sendUserActivationMail(to: string, token: string): Promise<void> {
        logger.info(`Sending user activation mail to: ${to}`)

        const mailData: any = {
            from: config.emailFrom,
            to: to,
            subject: 'Account Activation',
            html: `<h2 style="color: black;">Almost done..</h2>
            <p style="color: black;">Thank you for registering with us. In order to activate your account, please click the link below.</p>
            <a style="color: black;" href=${config.frontendUrl}/activateAccount?token=${token}>Activate Account</a>
            <p style="color: black;">Best,<br>The BMP Team`,
        }

        await this.transporter.sendMail(mailData)
    }

    public async sendResetPasswordMail(to: string, token: string): Promise<void> {
        logger.info(`Sending reset password mail to: ${to}`)

        const mailData: any = {
            from: config.emailFrom,
            to: to,
            subject: 'Reset Password Request',
            html: `<h2 style="color: black;">Password Reset</h2>
            <p style="color: black;">We're sending you this email because you requested a password reset. In order to reset your password, please click the link below.</p>
            <a style="color: black;" href=${config.frontendUrl}/resetPassword?token=${token}>Reset Password</a>
            <p style="color: black;">Best,<br>The BMP Team`,
        }

        await this.transporter.sendMail(mailData)
    }
}
