import { POST, route } from 'awilix-koa'
import { Context } from 'koa'
import MailingService from './mailingService'
import { UserActivationMailData } from './types'

@route('/mailing')
export default class MailingController {
    mailingService: MailingService

    constructor({ mailingService }: { mailingService: MailingService }) {
        this.mailingService = mailingService
    }

    @route('/userActivation/test')
    @POST()
    public async testMail(ctx: Context): Promise<any> {
        const { to, token }: UserActivationMailData = <UserActivationMailData>ctx.request.body
        await this.mailingService.sendUserActivationMail(to, token)
        ctx.status = 200
    }
}
