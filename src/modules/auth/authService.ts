import { EntityRepository } from '@mikro-orm/mysql'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import UserService from '../user/userService'
import User from '../../database/entities/User'
import { config } from '../../config'
import { UserData } from './types'

export default class AuthService {
    userService: UserService
    userRepository: EntityRepository<User>

    constructor({ userService, userRepository }: { userService: UserService; userRepository: EntityRepository<User> }) {
        this.userService = userService
        this.userRepository = userRepository
    }

    public async signUp(userData: UserData): Promise<void> {
        await this.userService.createUser(userData)
        //TODO add sending mail with email verification link
    }

    public async signIn(username: string, password: string): Promise<string> {
        const user: User = await this.userRepository.findOneOrFail({ username: username })

        const isPasswordMatched: boolean = await bcrypt.compare(password, user.password)
        if (!isPasswordMatched) {
            throw new Error('Incorrect password!')
        }

        const token: string = this.generateToken(user.id)
        return token
    }

    private generateToken(userId: number): string {
        const tokenPayload: any = { id: userId }
        const token = jwt.sign(tokenPayload, config.jwtSecret)
        return token
    }
}
