export const ServerStatus = async (_req: any, res: any) => {
  res.end(JSON.stringify({status: 'online', version: '1.0.0', client_version: '1.0.0'}))
}