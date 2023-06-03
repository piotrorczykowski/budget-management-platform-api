import { Context } from 'koa'
import User from '../database/entities/User'
import { UserRole } from '../database/enums'

async function checkUserRole(roles: UserRole[], ctx: Context, next: () => Promise<any>) {
    const user: User = ctx.state?.user

    if (roles.includes(user?.role)) {
        return await next()
    }

    ctx.status = 403
    return
}

const roleCheckMiddleware = (roles: UserRole[]) => {
    const middleware: any = async (ctx: Context, next: () => Promise<any>) => checkUserRole(roles, ctx, next)
    return middleware
}

export default roleCheckMiddleware
