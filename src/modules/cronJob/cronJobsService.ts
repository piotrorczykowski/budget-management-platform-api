import AnalyticsService from '../analytics/analyticsService'

export default class CronJobsService {
    analyticsService: AnalyticsService

    constructor({ analyticsService }: { analyticsService: AnalyticsService }) {
        this.analyticsService = analyticsService
    }

    public async forceJobs(): Promise<void> {
        return null
    }
}
