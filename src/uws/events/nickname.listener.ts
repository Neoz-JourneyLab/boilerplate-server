import {listenersStore} from '../listeners-store'
import {Client} from '../client'
import {dataSource} from '../../database/datasource'
import {UserEntity} from '../../database/entity/user.entity'
import {v4} from 'uuid'

listenersStore.on('nickname', async (client: Client, data: { name: string, nickname: string, level: string }) => {
  await UpdateNickname(client, data.nickname)
})

export async function UpdateNickname(client: Client, nickname: string): Promise<UserEntity> {
  console.log('user', client.socketId, 'updated nick : ', nickname)
  let user: UserEntity | null = await dataSource.manager.getRepository(UserEntity).findOneBy({socket_id: client.socketId})
  if (user && user.nickname != nickname) {
    console.log('user with same socket found, but not same nickname ', user)
    await dataSource.manager.createQueryBuilder()
      .update(UserEntity).set({nickname: nickname})
      .where({id: user.id}).execute()
  }
  if (!user) {
    user = await dataSource.manager.getRepository(UserEntity).findOneBy({nickname: nickname})
    if (!user) {
      user = new UserEntity()
      user.id = v4()
      user.nickname = nickname
      user.socket_id = client.socketId
      console.log('creating new user', user)
      await dataSource.manager.createQueryBuilder().insert().into(UserEntity).values({
        nickname: nickname,
        socket_id: client.socketId,
        id: user.id
      }).execute()
    } else {
      console.log('user with same name found, updating socket ID', user)
      await dataSource.manager.createQueryBuilder()
        .update(UserEntity).set({socket_id: client.socketId})
        .where({id: user.id}).execute()
    }
  }
  return user
}
