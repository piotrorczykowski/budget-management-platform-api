import { EntityRepository } from '@mikro-orm/core'
import bcrypt from 'bcrypt'
import User from '../../database/entities/User'
import { UserRole } from '../../database/enums'
import logger from '../../winston'

export default class UserService {
    userRepository: EntityRepository<User>

    constructor({ userRepository }: { userRepository: EntityRepository<User> }) {
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
        const isUsernameUnavailable: boolean = await this.isUserWithUsernameExists(username)
        if (isUsernameUnavailable) {
            throw new Error('Username is already used')
        }

        const isEmailUnavailable: boolean = await this.isUserWithEmailExists(email)
        if (isEmailUnavailable) {
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
    }

    private async isUserWithUsernameExists(username: string): Promise<boolean> {
        const userWithGivenUsername: User = await this.userRepository.findOne({ username: username })
        return !!userWithGivenUsername
    }

    public async isUserWithEmailExists(email: string): Promise<boolean> {
        const userWithGivenEmail: User = await this.userRepository.findOne({ email: email })
        return !!userWithGivenEmail
    }

    private async getHashPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt()
        const hashedPassword: string = await bcrypt.hash(password, salt)
        return hashedPassword
    }

    public async activateUser(email: string): Promise<void> {
        const user: User = await this.userRepository.findOneOrFail({ email: email })
        user.isActive = true
        await this.userRepository.persistAndFlush(user)
    }

    public async updatePassword(email: string, password: string): Promise<void> {
        const user: User = await this.userRepository.findOneOrFail({ email: email })
        const hashedPassword: string = await this.getHashPassword(password)

        user.password = hashedPassword

        await this.userRepository.persistAndFlush(user)
    }
}
