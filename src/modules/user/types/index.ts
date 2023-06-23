import { Currency } from '../../../database/enums'

export type UserData = {
    id: number
    username: string
    fullName: string
    email: string
    currency: Currency
    password?: string
}
