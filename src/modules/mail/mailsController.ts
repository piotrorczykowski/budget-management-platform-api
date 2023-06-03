import { POST, route } from 'awilix-koa'
import { Context } from 'koa'
import MailsService from './mailsService'
import { MailData } from './types'

@route('/mails')
export default class MailsController {
    mailsService: MailsService

    constructor({ mailsService }: { mailsService: MailsService }) {
        this.mailsService = mailsService
    }

    // TODO add role check middleware
    @route('/user-activation/test')
    @POST()
    public async userActivationTest(ctx: Context): Promise<any> {
        const { to, token }: MailData = <MailData>ctx.request.body
        await this.mailsService.sendUserActivationMail(to, token)
        ctx.status = 200
    }

    // TODO add role check middleware
    @route('/reset-password/test')
    @POST()
    public async resetPasswordTest(ctx: Context): Promise<any> {
        const { to, token }: MailData = <MailData>ctx.request.body
        await this.mailsService.sendResetPasswordMail(to, token)
        ctx.status = 200
    }
}
