import {listenersStore} from '../listeners-store'
import {Client} from '../client'
import {clientsStore} from '../clients-store'

listenersStore.on('zombie:dead', async (client: Client, data: { zid: string }) => {
  clientsStore.broadcast('zombie:dead', data, client.channels[0])
})
