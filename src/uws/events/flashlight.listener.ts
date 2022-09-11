import {listenersStore} from "../listeners-store"
import {Client} from "../client"
import { clientsStore } from "../clients-store"

listenersStore.on('flashlight:emit', async (client: Client, data: {flashlightState: boolean}) => {
    clientsStore.broadcastOther(client, "flashlight:receive", {uuid : client.socketId, state: data.flashlightState  } )
})
