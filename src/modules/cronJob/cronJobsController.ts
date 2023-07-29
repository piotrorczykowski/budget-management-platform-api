import { POST, before, route } from 'awilix-koa'
import roleCheckMiddleware from '../../middleware/roleCheckMiddleware'
import { UserRole } from '../../database/enums'
import { Context } from 'koa'
import CronJobsService from './cronJobsService'

@before(roleCheckMiddleware([UserRole.ADMIN]))
@route('/cron-jobs')
export default class CronJobsController {
    cronJobsService: CronJobsService

    constructor({ cronJobsService }: { cronJobsService: CronJobsService }) {
        this.cronJobsService = cronJobsService
    }

    @route('/force')
    @POST()
    public async forceJobs(ctx: Context) {
        await this.cronJobsService.forceJobs()
        ctx.status = 200
    }
}
