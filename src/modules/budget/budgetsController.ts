import { POST, route } from 'awilix-koa'
import { Context } from 'koa'
import BudgetsService from './budgetsService'
import { BudgetData } from './types'

@route('/budgets')
export default class BudgetsController {
    budgetsService: BudgetsService

    constructor({ budgetsService }: { budgetsService: BudgetsService }) {
        this.budgetsService = budgetsService
    }

    @route('/')
    @POST()
    public async createBudget(ctx: Context) {
        ctx.body = await this.budgetsService.createBudget(ctx.state.user, <BudgetData>ctx.request.body)
        ctx.status = 201
    }
}
