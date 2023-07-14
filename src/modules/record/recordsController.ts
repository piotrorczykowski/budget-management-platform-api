import { DELETE, GET, POST, PUT, route } from 'awilix-koa'
import RecordsService from './recordsService'
import { Context } from 'koa'
import { RecordData } from './types'

@route('/records')
export default class RecordsController {
    recordsService: RecordsService

    constructor({ recordsService }: { recordsService: RecordsService }) {
        this.recordsService = recordsService
    }

    // TODO add middleware for user access validation
    @route('/')
    @POST()
    public async createRecord(ctx: Context) {
        ctx.body = await this.recordsService.handleRecordCreation(<RecordData>ctx.request.body)
        ctx.status = 201
    }

    // TODO add middleware for user access validation
    @route('/:recordId')
    @PUT()
    public async updateRecord(ctx: Context) {
        ctx.body = await this.recordsService.handleRecordUpdate(ctx.params.recordId, <RecordData>ctx.request.body)
        ctx.status = 200
    }

    // TODO add middleware for user access validation
    @route('/:recordId')
    @DELETE()
    public async deleteRecord(ctx: Context) {
        ctx.body = await this.recordsService.deleteRecord(ctx.params.recordId)
        ctx.status = 204
    }

    // TODO add middleware for user access validation
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
