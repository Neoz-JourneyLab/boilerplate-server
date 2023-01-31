import {listenersStore} from '../listeners-store'
import {Client} from '../client'
import {UserEntity} from '../../database/entity/user.entity'
import {dataSource} from '../../index'
import {MessageEntity} from '../../database/entity/message.entity'
import {clientsStore} from '../clients-store'
import chalk from 'chalk'

listenersStore.on('set:distributed/read', async (client: Client, data: { id: string, from: string, action: string }) => {
  try {
    const users = await getBothUsers(client.socketId, data.from)
    const to: UserEntity = users.user2

    const date = new Date()
    date.setMilliseconds(0)

    if(data.action == 'distributed') {
      await dataSource.manager.createQueryBuilder().update(MessageEntity).set({
        distributed_at: date
      }).where('id = :id', {id: data.id}).execute()
    } else if(data.action == 'read'){
      await dataSource.manager.createQueryBuilder().update(MessageEntity).set({
        read_at: date
      }).where('id = :id', {id: data.id}).execute()
    } else throw new Error(`unknown action : ${data.action}`)

    console.log(chalk.rgb(70, 50, 250)`message ${data.id} ${data.action}!`)
    if (to.socket_id != null) {
      clientsStore.getBySocketId(to.socket_id)?.emit('message:distributed/read', {id: data.id, action: data.action})
    }
  } catch (err) {
    client.emitError('0', err as string)
  }
})

export const getBothUsers = async function (ourSocketId: string, valOther: string, byId: boolean = true): Promise<{ user: UserEntity, user2: UserEntity }> {
  const user: UserEntity | null = await dataSource.manager.getRepository(UserEntity).findOneBy({socket_id: ourSocketId})
  const to: UserEntity | null =
    byId ? await dataSource.manager.getRepository(UserEntity).findOneBy({id: valOther})
      : await dataSource.manager.getRepository(UserEntity).findOneBy({nickname: valOther})
  if (!user) {
    throw new Error('user not found')
  }
  if (!to) {
    throw new Error(`user to not found ${valOther} (${byId?'by Id':'by nickname'}`)
  }
  return {user: user, user2: to}
}