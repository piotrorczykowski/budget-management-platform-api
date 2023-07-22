import { GET, route } from 'awilix-koa'
import AnalyticsService from './analyticsService'
import { Context } from 'koa'

@route('/analytics')
export default class AnalyticsController {
    analyticsService: AnalyticsService

    constructor({ analyticsService }: { analyticsService: AnalyticsService }) {
        this.analyticsService = analyticsService
    }

    @route('/cash-flow/:date')
    @GET()
    public async getCashFlow(ctx: Context) {
        const dateFromTimestamp: Date = new Date(ctx.params.date * 1000)
        ctx.body = await this.analyticsService.getCashFlow(ctx.state.user.id, dateFromTimestamp)
        ctx.status = 200
    }
}
