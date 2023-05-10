import passport from 'koa-passport'
import passportJWT from 'passport-jwt'
import { EntityRepository } from '@mikro-orm/core'
import { AwilixContainer } from 'awilix'
import { getContainer } from './server'
import User from './database/entities/User'
import { config } from './config'

const JWTStrategy = passportJWT.Strategy
const ExtractJwt = passportJWT.ExtractJwt

function checkJWT(payload, done) {
    const container: AwilixContainer = getContainer()
    const userRepository: EntityRepository<User> = container.resolve('userRepository')

    const userId: number = payload.id
    userRepository
        .findOneOrFail({ id: userId }, { fields: ['username', 'role'] })
        .then((user) => {
            return done(null, user)
        })
        .catch((err) => {
            return done(err)
        })
}

export default () => {
    const passportConfig: any = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: config.jwtSecret,
    }

    passport.use(new JWTStrategy(passportConfig, checkJWT))
}
