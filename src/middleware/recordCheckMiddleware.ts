import { EntityRepository } from '@mikro-orm/mysql'
import { UserRole } from '../database/enums'
import { getContainer } from '../server'
import { AwilixContainer } from 'awilix'
import User from '../database/entities/User'
import Record from '../database/entities/Record'

class RecordCheck {
    ctx: any
    recordRepository: EntityRepository<Record>

    constructor({ ctx, recordRepository }: { ctx: any; recordRepository: EntityRepository<Record> }) {
        this.ctx = ctx
        this.recordRepository = recordRepository
    }

    async getUserRecordIds(userId: number): Promise<number[]> {
        const userRecordIds: number[] = (await this.recordRepository.find({ account: { user: { id: userId } } }))?.map(
            (record) => record.id
        )
        return userRecordIds
    }

    async checkUserToAccountAssociation(next: () => Promise<any>) {
        const reqUser: User = this.ctx.state.user
        if (reqUser.role === UserRole.ADMIN) {
            return await next()
        }

        const recordId: number = Number(this.ctx.params.recordId)
        const userRecordIds: number[] = await this.getUserRecordIds(reqUser.id)
        const isRecordAssociatedWithUser: boolean = userRecordIds.includes(recordId)
        if (isRecordAssociatedWithUser) {
            return await next()
        }

        this.ctx.status = 403
        return
    }
}

const recordCheckMiddleware = (ctx, next) => {
    const container: AwilixContainer = getContainer()
    const recordRepository: EntityRepository<Record> = container.resolve('recordRepository')
    const checker: RecordCheck = new RecordCheck({
        ctx,
        recordRepository,
    })

    return checker.checkUserToAccountAssociation(next)
}

export default recordCheckMiddleware
