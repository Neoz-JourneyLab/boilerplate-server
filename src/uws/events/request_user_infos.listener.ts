import {listenersStore} from '../listeners-store'
import {Client} from '../client'
import {UserEntity} from '../../database/entity/user.entity'
import {dataSource} from '../../index'
import chalk from 'chalk'

/**
 * give info about an user, from his nickname or his id
 */
listenersStore.on('request:user:info', async (client: Client, data: { nickname: string, id: string }) => {
  const user: UserEntity | null = await dataSource.manager
    .getRepository(UserEntity)
    .findOneBy({socket_id: client.socketId})
  if (!user) throw new Error(`user not found for sid ${client.socketId}`)

  const req: string = data.nickname == null ? 'user.id = :val' : 'user.nickname = :val'
  const val: string = data.nickname == null ? data.id : data.nickname

  //get the foreign user
  const otherUser: UserEntity | null = await dataSource.manager.getRepository(UserEntity)
    .createQueryBuilder('user')
    .where(req, {val: val})
    .select(['user.id', 'user.nickname', 'user.default_public_rsa'])
    .getOne()

  if (!otherUser) {
    client.emit('user:info', {err: `contact not found`})
    return
  }
  if (otherUser.id == user.id) {
    client.emit('user:info', {err: `cannot ask for yourself`})
    return
  }
  console.log(chalk.cyan(`user ${user.nickname} request info about ${data.nickname == null ? data.id : data.nickname}`))

  //emit user information
  client.emit('user:info', {
    nickname: otherUser.nickname,
    id: otherUser.id,
    default_public_rsa: otherUser.default_public_rsa
  })
})
