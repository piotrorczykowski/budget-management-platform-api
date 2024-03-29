import { GET, PUT, before, route } from 'awilix-koa'
import { Context } from 'koa'
import UsersService from './usersService'
import { UserData } from './types'
import userCheckMiddleware from '../../middleware/userCheckMiddleware'
import roleCheckMiddleware from '../../middleware/roleCheckMiddleware'
import { UserRole } from '../../database/enums'

@route('/users')
export default class UsersController {
    usersService: UsersService

    constructor({ usersService }: { usersService: UsersService }) {
        this.usersService = usersService
    }

    @before(roleCheckMiddleware([UserRole.ADMIN]))
    @route('/')
    @GET()
    public async getUsers(ctx: Context) {
        ctx.body = await this.usersService.getUsers({
            page: Number(ctx.query.page),
            pageSize: Number(ctx.query.pageSize),
            searchByValue: <string>ctx.query.searchByValue,
        })
        ctx.status = 200
    }

    @route('/me')
    @GET()
    public async getRequestedUser(ctx: Context) {
        ctx.body = await this.usersService.getRequestedUser(ctx.state.user.id)
        ctx.status = 200
    }

    @before(userCheckMiddleware)
    @route('/:id')
    @PUT()
    public async updateUser(ctx: Context) {
        ctx.body = await this.usersService.updateUser(ctx.params.id, <UserData>ctx.request.body)
        ctx.status = 200
    }
}
