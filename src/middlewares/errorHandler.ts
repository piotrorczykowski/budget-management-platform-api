const errorHandler = async (ctx, next) => {
    try {
        await next()
    } catch (error) {
        ctx.status = 400
        ctx.body = { Error: error.message }
        console.log(error.message)
    }
}

export default errorHandler
