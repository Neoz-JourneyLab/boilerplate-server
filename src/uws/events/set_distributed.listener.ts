import {listenersStore} from '../listeners-store'
import {Client} from '../client'
import {UserEntity} from '../../database/entity/user.entity'
import {dataSource} from '../../index'
import {MessageEntity} from '../../database/entity/message.entity'
import {clientsStore} from '../clients-store'
import chalk from 'chalk'

listenersStore.on('set:distributed', async (client: Client, data: { id: string, from: string }) => {
  const users = await getBothUsers(client.socketId, data.from)
  const to: UserEntity = users.user2

  const date = new Date()
  date.setMilliseconds(0)

  await dataSource.manager.createQueryBuilder().update(MessageEntity)
    .set({distributed_at: date})
    .where('id = :id', {id: data.id}).execute()

  console.log(chalk.rgb(70, 50, 250)`message ${data.id} distributed!`)
  if (to.socket_id != null) {
    clientsStore.getBySocketId(to.socket_id)?.emit('message:distributed', {id: data.id, with: users.user.id})
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
    throw new Error(`user to not found ${valOther} (${byId ? 'by Id' : 'by nickname'}`)
  }
  return {user: user, user2: to}
}