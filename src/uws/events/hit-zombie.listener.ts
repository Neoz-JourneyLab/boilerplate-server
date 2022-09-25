import {listenersStore} from '../listeners-store'
import {Client} from '../client'
import {clientsStore} from '../clients-store'

listenersStore.on('hit:zombie', async (client: Client, data: { damages: number, zid: string }) => {
  clientsStore.broadcast('hit:zombie', data, client.channels[0])
})
