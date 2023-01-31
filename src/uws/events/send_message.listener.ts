import {listenersStore} from '../listeners-store'
import {Client} from '../client'
import {UserEntity} from '../../database/entity/user.entity'
import {dataSource} from '../../index'
import {v4} from 'uuid'
import {MessageEntity} from '../../database/entity/message.entity'
import {clientsStore} from '../clients-store'
import {getBothUsers} from './set_distributed.listener'

listenersStore.on('send:message', async (client: Client, data: {
  cipher: string,
  to: string, ratchet_infos: string, ratchet_id: string
}) => {
  console.log(data)
  try {
    const users = await getBothUsers(client.socketId, data.to)
    const user: UserEntity = users.user
    const to: UserEntity = users.user2

    const uuid: string = v4()
    const date = new Date()
    date.setMilliseconds(0)
    await dataSource.manager.createQueryBuilder().insert().into(MessageEntity).values({
      id: uuid,
      from: user,
      to: to,
      cipher: data.cipher,
      ratchet_infos: data.ratchet_infos,
      send_at: date,
      distributed_at: to.socket_id == null ? null : date
    }).execute()

    const message = {
      from: user.id,
      to: to.id,
      id: uuid,
      cipher: data.cipher,
      ratchet_infos: data.ratchet_infos,
      content: data.cipher,
      send_at: date,
      distributed: to.socket_id != null,
    }
    client.emit('new:message', message)
    if (to.socket_id != null) {
      clientsStore.getBySocketId(to.socket_id)?.emit('new:message', message)
    }
  } catch (err) {
    client.emitError(__filename.split('\\')[__filename.split('\\').length], err as string)
  }
})
