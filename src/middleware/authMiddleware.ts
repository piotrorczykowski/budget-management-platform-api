import passport from 'koa-passport'
import logger from './winston'
import { PUBLIC_ENDPOINTS } from './types/constants'

const authMiddleware = async (ctx, next) => {
    const requestEndpoint: string = ctx.request.url
    const isEndpointPublic: boolean = PUBLIC_ENDPOINTS.some((publicEndpoint) => requestEndpoint.match(publicEndpoint))

    if (isEndpointPublic) {
        await next()
    } else {
        await passport.authenticate('jwt', { session: false }, async (err, user) => {
            if (user) {
                ctx.state.user = user
                await next()
            } else {
                logger.error(err)
                ctx.status = 401
                return
            }
        })(ctx, next)
    }
}

export default authMiddleware
