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

    public async sendMail(to: string, subject: string): Promise<void> {
        const mailData: any = {
            from: config.emailFrom,
            to: to,
            subject: subject,
            html: '<strong>Hello world?</strong>',
        }

        await this.transporter.sendMail(mailData)
    }
}
