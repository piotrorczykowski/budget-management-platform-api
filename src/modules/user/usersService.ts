import { EntityRepository } from '@mikro-orm/core'
import bcrypt from 'bcrypt'
import User from '../../database/entities/User'
import jwt from 'jsonwebtoken'
import { UserRole } from '../../database/enums'
import MailsService from '../mail/mailsService'
import { config } from '../../config'
import logger from '../../middleware/winston'

export default class UserService {
    mailsService: MailsService
    userRepository: EntityRepository<User>

    constructor({
        mailsService,
        userRepository,
    }: {
        mailsService: MailsService
        userRepository: EntityRepository<User>
    }) {
        this.mailsService = mailsService
        this.userRepository = userRepository
    }

    public async createUser({
        username,
        fullName,
        email,
        password,
    }: {
        username: string
        fullName: string
        email: string
        password: string
    }): Promise<void> {
        logger.info('Creating new user...')
        const isUsernameAvailable: boolean = await this.checkUsernameAvailability(username)
        if (!isUsernameAvailable) {
            throw new Error('Username is already used')
        }

        const isEmailAvailable: boolean = await this.checkEmailAvailability(email)
        if (!isEmailAvailable) {
            throw new Error('Email is already used')
        }

        const user: User = new User()
        user.username = username
        user.fullName = fullName
        user.email = email
        user.isActive = false
        user.role = UserRole.USER

        const hashedPassword: string = await this.getHashPassword(password)
        user.password = hashedPassword

        await this.userRepository.persistAndFlush(user)

        await this.sendUserActivationMail(email)
    }

    private async checkUsernameAvailability(username: string): Promise<boolean> {
        const userWithGivenUsername: User = await this.userRepository.findOne({ username: username })
        return !userWithGivenUsername
    }

    private async checkEmailAvailability(email: string): Promise<boolean> {
        const userWithGivenEmail: User = await this.userRepository.findOne({ email: email })
        return !userWithGivenEmail
    }

    private async getHashPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt()
        const hashedPassword: string = await bcrypt.hash(password, salt)
        return hashedPassword
    }

    private async sendUserActivationMail(email: string): Promise<void> {
        logger.info(`Sending user activation mail to: ${email}...`)
        const token: string = this.generateTokenForUser(email)
        await this.mailsService.sendUserActivationMail(email, token)
    }

    private generateTokenForUser(email: string): string {
        const expirationTime: number = 60 * 60 // 1 hour
        const tokenPayload: { email: string } = { email: email }
        const token: string = jwt.sign(tokenPayload, config.jwtSecret, { expiresIn: expirationTime })
        return token
    }

    public async activateUser(email: string): Promise<void> {
        const user: User = await this.userRepository.findOneOrFail({ email: email })
        user.isActive = true
        await this.userRepository.persistAndFlush(user)
    }
}
