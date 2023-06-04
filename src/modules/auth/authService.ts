import { EntityRepository } from '@mikro-orm/mysql'
import bcrypt from 'bcrypt'
import jwt, { JwtPayload } from 'jsonwebtoken'
import UsersService from '../user/usersService'
import MailsService from '../mail/mailsService'
import User from '../../database/entities/User'
import { config } from '../../config'
import { UserData } from './types'
import logger from '../../winston'

export default class AuthService {
    usersService: UsersService
    mailsService: MailsService
    userRepository: EntityRepository<User>

    constructor({
        usersService,
        mailsService,
        userRepository,
    }: {
        usersService: UsersService
        mailsService: MailsService

        userRepository: EntityRepository<User>
    }) {
        this.usersService = usersService
        this.mailsService = mailsService

        this.userRepository = userRepository
    }

    public async signUp(userData: UserData): Promise<void> {
        await this.usersService.createUser(userData)
        await this.sendUserActivationMail(userData.email)
    }

    public async sendUserActivationMail(email: string): Promise<void> {
        const customExpirationTime: number = 60 * 60 * 24 // one day
        const token: string = this.generateTokenForUser(email, customExpirationTime)
        await this.mailsService.sendUserActivationMail(email, token)
    }

    public async signIn(username: string, password: string): Promise<string> {
        const user: User = await this.userRepository.findOneOrFail({ username: username, isActive: true })

        const isPasswordMatched: boolean = await bcrypt.compare(password, user.password)
        if (!isPasswordMatched) {
            throw new Error('Incorrect password!')
        }

        const token: string = this.generateToken(user.id)
        return token
    }

    private generateToken(userId: number): string {
        const tokenPayload: { id: number } = { id: userId }
        const token: string = jwt.sign(tokenPayload, config.jwtSecret)
        return token
    }

    public async activateUser(token: string): Promise<void> {
        logger.info('Activating user...')
        const email: string = await this.getEmailFromToken(token)
        await this.usersService.activateUser(email)
    }

    public async forgotPassword(email: string): Promise<void> {
        logger.info('Resetting password via email')
        const isEmailCorrect: boolean = await this.usersService.isUserWithEmailExists(email)
        if (!isEmailCorrect) {
            throw new Error(`There is no user with given email: ${email}`)
        }

        const token: string = this.generateTokenForUser(email)
        await this.mailsService.sendResetPasswordMail(email, token)
    }

    private generateTokenForUser(email: string, customExpirationTime?: number): string {
        const expirationTime: number = customExpirationTime || 60 * 60 // 1 hour
        const tokenPayload: { email: string } = { email: email }
        const token: string = jwt.sign(tokenPayload, config.jwtSecret, { expiresIn: expirationTime })
        return token
    }

    public async resetPassword(token: string, password: string): Promise<void> {
        logger.info('Updating forgotten password')
        const email: string = await this.getEmailFromToken(token)
        await this.usersService.updatePassword(email, password)
    }

    private getEmailFromToken(token: string): string {
        const tokenPayload: JwtPayload = <JwtPayload>jwt.verify(token, config.jwtSecret)
        const email: string = tokenPayload.email
        return email
    }
}
