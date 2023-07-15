import { UserRole } from '../database/enums'
import User from '../database/entities/User'

class UserCheck {
    ctx: any

    constructor({ ctx }: { ctx: any }) {
        this.ctx = ctx
    }

    async checkUserPermission(next: () => Promise<any>) {
        const reqUser: User = this.ctx.state.user
        if (reqUser.role === UserRole.ADMIN) {
            return await next()
        }

        const userId: number = Number(this.ctx.params.userId)
        const isUserManagingItself: boolean = userId === reqUser.id
        if (isUserManagingItself) {
            return await next()
        }

        this.ctx.status = 403
        return
    }
}

const userCheckMiddleware = (ctx, next) => {
    const checker: UserCheck = new UserCheck({
        ctx,
    })

    return checker.checkUserPermission(next)
}

export default userCheckMiddleware
