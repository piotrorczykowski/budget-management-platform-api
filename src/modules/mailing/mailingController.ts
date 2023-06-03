import { POST, route } from 'awilix-koa'
import { Context } from 'koa'
import MailingService from './mailingService'
import { MailData } from './types'

@route('/mailing')
export default class MailingController {
    mailingService: MailingService

    constructor({ mailingService }: { mailingService: MailingService }) {
        this.mailingService = mailingService
    }

    // TODO add role check middleware
    @route('/userActivation/test')
    @POST()
    public async userActivationTest(ctx: Context): Promise<any> {
        const { to, token, userId }: MailData = <MailData>ctx.request.body
        await this.mailingService.sendUserActivationMail(to, token, userId)
        ctx.status = 200
    }

    // TODO add role check middleware
    @route('/resetPassword/test')
    @POST()
    public async resetPasswordTest(ctx: Context): Promise<any> {
        const { to, token, userId }: MailData = <MailData>ctx.request.body
        await this.mailingService.sendResetPasswordMail(to, token, userId)
        ctx.status = 200
    }
}
