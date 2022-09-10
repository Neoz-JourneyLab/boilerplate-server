import {listenersStore} from "../listeners-store"
import {Client} from "../client"

listenersStore.on('ping', async (client: Client, data: {ping_id: string}) => {
  try {
    client.emit('pong', {ping_id: data.ping_id, server_time: new Date().toJSON()})
  } catch (err) {
    client.emitError('pong', err as string)
  }
})
