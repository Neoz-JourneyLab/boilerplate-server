import * as uws from 'uWebSockets.js'
import {HttpRequest, HttpResponse, us_socket_context_t} from 'uWebSockets.js'
import {lstatSync, readdirSync} from "fs"
import {resolve} from "path"
import chalk from 'chalk'
import {Client} from './client'
import {clientsStore} from './clients-store'
import {listenersStore} from './listeners-store'
import {env} from '../env'
//import {dataSource} from "../index";
//import {UserEntity} from '../database/entity/user.entity'

export const GetUws = async () => {
  const socketUnityOptions: uws.AppOptions = {}
  const socketUnity = uws.App(socketUnityOptions)

  const files: string[] = readdirSync(resolve(__dirname, 'events'))
  for (const file of files) {
    const filePath: string = resolve(__dirname, 'events', file)
    if (lstatSync(filePath).isFile()) {
      await import(filePath)
    }
  }
  console.info(chalk.green.bold(files.length, 'listeners loaded'))

  socketUnity.ws('/', {
    /* Options */
    compression: 0
    , maxPayloadLength: 16 * 1024 * 1024
    , idleTimeout: 8

    /* Handlers */
    , upgrade: (res: HttpResponse, req: HttpRequest, context: us_socket_context_t) => {
      const clientIps: string[] = req.getHeader('x-forwarded-for').split(',')
      let clientIp: string | null = null
      if (clientIps.length) clientIp = clientIps[0]

      res.upgrade(
        {clientIp: clientIp}
        , req.getHeader('sec-websocket-key')
        , req.getHeader('sec-websocket-protocol')
        , req.getHeader('sec-websocket-extensions')
        , context,
      )
    }

    , open: async (ws: uws.WebSocket) => {
      const client: Client = new Client(ws)
      console.log('WebSocket Socket client connected !', client.socketId)
      client.emit('socket:connected', {players: clientsStore.store.size})
    },
    message: async (ws, raw, isBinary) => {
      if (isBinary) {
        console.error('data is binary')
        return
      }
      const buffer: Buffer = Buffer.from(raw)
      const data: { ev: string, id: string, data: string } = JSON.parse(buffer.toString())
      const client: Client | undefined = clientsStore.getBySocketId(data.id)
      if (!client) {
        console.error(`client not found for socket ID ${data.id}, ev ${data.ev}`)
        ws.close()
        return
      }
      try {
        if (!data.ev || data.ev.trim() === '') {
          throw new Error('event not specified !')
        }
        await listenersStore.exec(data.ev, client, data.data == "" ? "" : JSON.parse(data.data))
      } catch (e) {
        const str: string = (e as string).toString()
        console.info(`error:', ${str}, ${data.ev}`)
        client.emit('err', str)
      }
    },
    /*drain: (_ws) => {
    },*/
    close: async (ws: uws.WebSocket/*, _code: number, _raw: ArrayBuffer*/) => {
      clientsStore.delete(ws.id)
      console.log('closing socket ', ws.id)
      /*await dataSource.manager.createQueryBuilder()
        .update(UserEntity).set({socket_id: null})
        .where('socket_id = :sid', {sid: ws.id}).execute()*/
      try {
        ws.close()
      }catch (err){
        //ignored
      }
    },
  })

  socketUnity.listen(env.PORT, (listenSocket: any) => {
    console.info(listenSocket)
    if (listenSocket) {
      console.info('>', chalk.green(`Listening uws requests on port ${chalk.blue(env.PORT)}!`))
    } else {
      console.info('Start failed, clients can\'t connect')
    }
  })
}
