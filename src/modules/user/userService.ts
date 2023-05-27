import { EntityRepository } from '@mikro-orm/core'
import bcrypt from 'bcrypt'
import User from '../../database/entities/User'
import { UserRole } from '../../database/enums'

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
    }): Promise<User> {
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

        return await this.userRepository.upsert(user)
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
}
