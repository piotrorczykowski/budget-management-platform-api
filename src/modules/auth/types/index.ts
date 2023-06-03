export type UserData = {
    username: string
    fullName: string
    email: string
    password: string
}

export type UserSignInData = {
    username: string
    password: string
}

export type ResetPasswordData = {
    token: string
    password: string
}
