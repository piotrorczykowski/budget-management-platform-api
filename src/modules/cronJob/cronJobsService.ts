import { CronJob } from 'cron'
import AnalyticsService from '../analytics/analyticsService'

export default class CronJobsService {
    analyticsService: AnalyticsService

    constructor({ analyticsService }: { analyticsService: AnalyticsService }) {
        this.analyticsService = analyticsService
    }

    public async forceJobs(): Promise<void> {
        return null
    }

    public saveHistoricalAccountBalanceJob() {
        // first day of the month
        return new CronJob('0 0 * 1 * *', this.analyticsService.saveHistoricalAccountBalanceJob)
    }
}
