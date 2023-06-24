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
        ctx.body = await this.recordsService.createRecord(<RecordData>ctx.request.body)
        ctx.status = 201
    }

    // TODO add middleware for user access validation
    @route('/:userId')
    @GET()
    public async getPaginatedRecordsForUser(ctx: Context) {
        ctx.body = await this.recordsService.getPaginatedRecordsForUser(
            ctx.params.userId,
            Number(ctx.query.page),
            Number(ctx.query.pageSize)
        )
        ctx.status = 200
    }
}
