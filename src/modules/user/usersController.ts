import { GET, route } from 'awilix-koa'
import { Context } from 'koa'
import UsersService from './usersService'

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
}
