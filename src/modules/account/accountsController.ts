import { DELETE, GET, POST, route } from 'awilix-koa'
import { Context } from 'koa'
import AccountsService from './accountsService'
import { AccountData } from './types'

@route('/accounts')
export default class AccountsController {
    accountsService: AccountsService

    constructor({ accountsService }: { accountsService: AccountsService }) {
        this.accountsService = accountsService
    }

    @route('/')
    @POST()
    public async createAccount(ctx: Context) {
        ctx.body = await this.accountsService.createAccount(<AccountData>ctx.request.body, ctx.state.user.id)
        ctx.status = 201
    }

    @route('/:accountId')
    @DELETE()
    public async deleteAccount(ctx: Context) {
        ctx.body = await this.accountsService.deleteAccount(ctx.params.accountId)
        ctx.status = 204
    }

    // TODO add middleware for user access validation
    @route('/:userId')
    @GET()
    public async getUserAccounts(ctx: Context) {
        ctx.body = await this.accountsService.getUserAccounts(ctx.params.userId, <string>ctx.query.searchByValue)
        ctx.status = 200
    }
}
