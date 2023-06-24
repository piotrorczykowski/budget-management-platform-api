import { Context } from 'koa'
import { route, POST } from 'awilix-koa'
import AuthService from './authService'
import { ResetPasswordData, UserData, UserSignInData } from './types'

@route('/auth')
export default class AuthController {
    authService: AuthService

    constructor({ authService }: { authService: AuthService }) {
        this.authService = authService
    }

    @route('/signUp')
    @POST()
    public async signUp(ctx: Context): Promise<void> {
        const userData: UserData = <UserData>ctx.request.body
        await this.authService.signUp(userData)
        ctx.status = 201
    }

    @route('/resend-activation-mail')
    @POST()
    public async resendActivationMail(ctx: Context): Promise<void> {
        const { email }: { email: string } = <{ email: string }>ctx.request.body
        await this.authService.sendUserActivationMail(email)
        ctx.status = 200
    }

    @route('/signIn')
    @POST()
    public async signIn(ctx: Context): Promise<any> {
        const { username, password }: UserSignInData = <UserSignInData>ctx.request.body
        ctx.body = await this.authService.signIn(username, password)
        ctx.status = 200
    }

    @route('/activate-user')
    @POST()
    public async activateUser(ctx: Context): Promise<void> {
        const { token }: { token: string } = <{ token: string }>ctx.request.body
        await this.authService.activateUser(token)
        ctx.status = 200
    }

    @route('/forgot-password')
    @POST()
    public async forgotPassword(ctx: Context): Promise<void> {
        const { email }: { email: string } = <{ email: string }>ctx.request.body
        await this.authService.forgotPassword(email)
        ctx.status = 200
    }

    @route('/reset-password')
    @POST()
    public async resetPassword(ctx: Context): Promise<void> {
        const { token, password }: ResetPasswordData = <ResetPasswordData>ctx.request.body
        await this.authService.resetPassword(token, password)
        ctx.status = 200
    }
}
