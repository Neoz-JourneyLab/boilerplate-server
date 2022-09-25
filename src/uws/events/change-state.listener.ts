import {listenersStore} from '../listeners-store'
import {Client} from '../client'
import {clientsStore} from '../clients-store'

listenersStore.on('change:state', async (client: Client, data: { name: string }) => {
  clientsStore.broadcast('change:state', {name: data.name}, client.channels[0])
})