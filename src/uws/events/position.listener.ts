import {listenersStore} from "../listeners-store"
import {Client} from "../client"
import {clientsStore} from "../clients-store";

listenersStore.on('send:position', async (client: Client, data: { id: string, z: number, x: number, ry: number }) => {
  //client.emit('pong', {ping_id: data.ping_id, server_time: new Date().toJSON()})
  data.id = client.socketId
  clientsStore.broadcast('plot', data, client.channels[0])
})
