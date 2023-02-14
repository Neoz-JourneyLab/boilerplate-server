import {listenersStore} from "../listeners-store"
import {Client} from "../client"

/**
 * send back server time
 */
listenersStore.on('ping', async (client: Client, data: { ping_id: string }) => {
  client.emit('pong', {ping_id: data.ping_id, server_time: new Date().toJSON()})
})
