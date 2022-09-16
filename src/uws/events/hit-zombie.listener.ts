import {listenersStore} from "../listeners-store"
import {Client} from "../client"
import {clientsStore} from "../clients-store";

listenersStore.on('hit:zombie', async (_client: Client, data: { damages: number, zid: string }) => {
  console.log('zombie hit : ', data)
  clientsStore.broadcast('hit:zombie', data)
})
