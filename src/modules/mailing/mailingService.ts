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

    public async sendUserActivationMail(to: string, token: string): Promise<void> {
        const mailData: any = {
            from: config.emailFrom,
            to: to,
            subject: 'Account Activation',
            html: `<h1 style="color: black;">Almost done..</h1>
            <p>Thank you for registering with us. In order to activate your account please click the link below.</p>
            <a style="appearance: button;" href=${config.frontendUrl}/activateAccount/${token}>Activate Account</a>
            <p>Best,<br>The BMP Team
            </div>`,
        }

        await this.transporter.sendMail(mailData)
    }
}
