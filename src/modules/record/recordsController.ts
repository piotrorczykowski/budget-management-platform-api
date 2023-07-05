import { GET, POST, route } from 'awilix-koa'
import RecordsService from './recordsService'
import { Context } from 'koa'
import { RecordData } from './types'

@route('/records')
export default class RecordsController {
    recordsService: RecordsService

    constructor({ recordsService }: { recordsService: RecordsService }) {
        this.recordsService = recordsService
    }

    @route('/')
    @POST()
    public async createRecord(ctx: Context) {
        ctx.body = await this.recordsService.handleRecordCreation(<RecordData>ctx.request.body)
        ctx.status = 201
    }

    // TODO add middleware for user access validation
    @route('/:userId')
    @GET()
    public async getPaginatedRecordsForUser(ctx: Context) {
        ctx.body = await this.recordsService.getPaginatedRecordsForUser(
            ctx.params.userId,
            Number(ctx.query.page),
            Number(ctx.query.pageSize),
            ctx.query.sortingOption as string,
            Number(ctx.query.accountId),
            ctx.query.searchByValue as string,
            ctx.query.recordType as string,
            ctx.query.category as string
        )
        ctx.status = 200
    }
}
