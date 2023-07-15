import { DELETE, GET, POST, PUT, before, route } from 'awilix-koa'
import RecordsService from './recordsService'
import { Context } from 'koa'
import { RecordData } from './types'
import recordCheckMiddleware from '../../middleware/recordCheckMiddleware'
import userCheckMiddleware from '../../middleware/userCheckMiddleware'

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

    @before(recordCheckMiddleware)
    @route('/:recordId')
    @PUT()
    public async updateRecord(ctx: Context) {
        ctx.body = await this.recordsService.handleRecordUpdate(ctx.params.recordId, <RecordData>ctx.request.body)
        ctx.status = 200
    }

    @before(recordCheckMiddleware)
    @route('/:recordId')
    @DELETE()
    public async deleteRecord(ctx: Context) {
        ctx.body = await this.recordsService.handleRecordDelete(ctx.params.recordId)
        ctx.status = 204
    }

    @before(userCheckMiddleware)
    @route('/:userId')
    @GET()
    public async getPaginatedRecordsForUser(ctx: Context) {
        ctx.body = await this.recordsService.getPaginatedRecordsForUser({
            userId: ctx.params.userId,
            page: Number(ctx.query.page),
            pageSize: Number(ctx.query.pageSize),
            sortingOptions: <string>ctx.query.sortingOption,
            accountId: Number(ctx.query.accountId),
            searchByValue: <string>ctx.query.searchByValue,
            recordType: <string>ctx.query.recordType,
            category: <string>ctx.query.category,
        })
        ctx.status = 200
    }
}
