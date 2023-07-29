import { GET, before, route } from 'awilix-koa'
import AnalyticsService from './analyticsService'
import { Context } from 'koa'
import accountCheckMiddleware from '../../middleware/accountCheckMiddleware'
import userCheckMiddleware from '../../middleware/userCheckMiddleware'

@route('/analytics')
export default class AnalyticsController {
    analyticsService: AnalyticsService

    constructor({ analyticsService }: { analyticsService: AnalyticsService }) {
        this.analyticsService = analyticsService
    }

    @before(userCheckMiddleware)
    @route('/:userId/cash-flow/:date')
    @GET()
    public async getCashFlow(ctx: Context) {
        const dateFromTimestamp: Date = new Date(ctx.params.date * 1000)
        ctx.body = await this.analyticsService.getCashFlow(ctx.params.userId, dateFromTimestamp)
        ctx.status = 200
    }

    @before(userCheckMiddleware)
    @route('/:userId/expenses-structure/:date')
    @GET()
    public async getExpensesStructure(ctx: Context) {
        const dateFromTimestamp: Date = new Date(ctx.params.date * 1000)
        ctx.body = await this.analyticsService.getExpensesStructure(ctx.params.userId, dateFromTimestamp)
        ctx.status = 200
    }

    @before(accountCheckMiddleware)
    @route('/:accountId/account-balance/:date')
    @GET()
    public async getAccountBalanceTrend(ctx: Context) {
        const dateFromTimestamp: Date = new Date(ctx.params.date * 1000)
        ctx.body = await this.analyticsService.getAccountBalanceTrend(ctx.params.accountId, dateFromTimestamp)
        ctx.status = 200
    }

    @before(userCheckMiddleware)
    @route('/:userId/accounts-balance/:date')
    @GET()
    public async getAccountsBalanceTrend(ctx: Context) {
        const dateFromTimestamp: Date = new Date(ctx.params.date * 1000)
        ctx.body = await this.analyticsService.getAccountsBalanceTrend(ctx.params.userId, dateFromTimestamp)
        ctx.status = 200
    }
}
