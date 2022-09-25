import {listenersStore} from '../listeners-store'
import {Client} from '../client'
import {UserEntity} from '../../database/entity/user.entity'
import {dataSource} from '../../database/datasource'
import {ItemEntity} from '../../database/entity/item.entity'
import {ItemModelEntity} from '../../database/entity/item-model.entity'
import chalk from 'chalk'

listenersStore.on('item:amount', async (client: Client, data: { quantity: number, model: string, x: number, y: number }) => {
  const user: UserEntity | null = await dataSource.manager.getRepository(UserEntity).findOneBy({socket_id: client.socketId})
  //const user: UserEntity | null = await dataSource.manager.getRepository(UserEntity).findOneBy({nickname: 'Neoz'})

  if (!user) {
    throw new Error('user not found')
  }
  const model: ItemModelEntity | null = await dataSource.manager.getRepository(ItemModelEntity).findOneBy({id: data.model})
  if (!model) {
    throw new Error('model not found')
  }

  //on ne doit pas avoir d'objets en x, x+1, x+2...x+n (n = taille model)
  const userItems: ItemEntity[] = await dataSource.manager.getRepository(ItemEntity).createQueryBuilder('items')
    .innerJoin('items.user', 'user')
    .innerJoinAndSelect('items.model', 'model')
    .where('user.id = :id', {id: user.id})
    .select(['items.id', 'items.quantity', 'model.id', 'model.width', 'model.height', 'model.alias', 'items.x', 'items.y'])
    .getMany()

  console.log('place item in', data.x, data.y)
  const slotsTaken: string[] = []
  for (const item of userItems) {
    for (let x: number = 0; x < item.model.width; x++) {
      for (let y: number = 0; y < item.model.height; y++) {
        slotsTaken.push(`${x + item.x};${y + item.y}`)
      }
    }
  }
  console.log('slots taken :', slotsTaken)
  for (let x: number = 0; x < model.width; x++) {
    for (let y: number = 0; y < model.height; y++) {
      if(slotsTaken.includes(`${x + data.x};${y + data.y}`)){
        console.log(chalk.red('overlap item'))
        return
      }
    }
  }
  await dataSource.manager.createQueryBuilder().insert().into(ItemEntity).values({
    model: model,
    user: user,
    quantity: data.quantity,
    x: data.x,
    y: data.y
  }).execute()
})
