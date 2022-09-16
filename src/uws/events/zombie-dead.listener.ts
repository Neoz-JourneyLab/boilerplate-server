import {listenersStore} from "../listeners-store"
import {Client} from "../client"
import {clientsStore} from "../clients-store";

listenersStore.on('zombie:dead', async (_client: Client, data: { zid: string }) => {
  console.log('zombie dead : ', data)
  clientsStore.broadcast('zombie:dead', data)
})
