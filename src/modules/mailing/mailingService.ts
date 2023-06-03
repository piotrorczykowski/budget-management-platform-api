import nodemailer, { SentMessageInfo } from 'nodemailer'
import Mail from 'nodemailer/lib/mailer'
import { config } from '../../config'

export default class MailingService {
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

    public async sendUserActivationMail(to: string, token: string, userId: number): Promise<void> {
        const mailData: any = {
            from: config.emailFrom,
            to: to,
            subject: 'Account Activation',
            html: `<h2 style="color: black;">Almost done..</h2>
            <p>Thank you for registering with us. In order to activate your account please click the link below.</p>
            <a style="appearance: button;" href=${
                config.frontendUrl
            }/activateAccount?token=${token}&id=${userId.toString()}>Activate Account</a>
            <p>Best,<br>The BMP Team
            </div>`,
        }

        await this.transporter.sendMail(mailData)
    }

    public async sendResetPasswordMail(to: string, token: string, userId: number): Promise<void> {
        const mailData: any = {
            from: config.emailFrom,
            to: to,
            subject: 'Reset Password Request',
            html: `<h2 style="color: black;">Password Reset</h2>
            <p>We're sending you this email  because you requested a password reset. Click on this link to reset your password:</p>
            <a style="appearance: button;" href=${
                config.frontendUrl
            }/resetPassword?token=${token}&id=${userId.toString()}>Reset Password</a>
            <p>Best,<br>The BMP Team
            </div>`,
        }

        await this.transporter.sendMail(mailData)
    }
}
