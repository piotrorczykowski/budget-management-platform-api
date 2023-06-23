import { GET, PUT, route } from 'awilix-koa'
import { Context } from 'koa'
import UsersService from './usersService'
import { UserData } from './types'

@route('/users')
export default class UsersController {
    usersService: UsersService

    constructor({ usersService }: { usersService: UsersService }) {
        this.usersService = usersService
    }

    @route('/me')
    @GET()
    public async getRequestedUser(ctx: Context) {
        ctx.body = await this.usersService.getRequestedUser(ctx.state.user.id)
        ctx.status = 200
    }

    // TODO add middleware for user access validation
    @route('/:id')
    @PUT()
    public async updateUser(ctx: Context) {
        ctx.body = await this.usersService.updateUser(ctx.params.id, <UserData>ctx.request.body)
        ctx.status = 200
    }
}
