export async function GET(req: Request) {
    const config = await require('~/config')
    return Response.json(config.default)
}
