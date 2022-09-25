import {listenersStore} from '../listeners-store'
import {Client} from '../client'
import {clientsStore} from '../clients-store'

listenersStore.on('send:position', async (client: Client, data: { id: string, z: number, x: number, ry: number, flashLight: number }) => {
  data.id = client.socketId
  clientsStore.broadcast('plot', data, client.channels[0])
})
