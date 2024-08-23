import {DataSource} from 'typeorm'
//import {getExpress} from './http/express'
import {UserEntity} from './database/entity/user.entity'
import {env} from './env'
import {MessageEntity} from './database/entity/message.entity'

//const cron = require("node-cron");

export const dataSource = new DataSource({
  url: env.TYPEORM_URL,
  type: 'postgres',
  synchronize: true,
  entities: [UserEntity, MessageEntity],
})

/**
 * start the server
 */
dataSource.initialize().then(async () => {
  const list:{id: string, position: number}[] = [
    {id: 'aaa', position: 9},
    {id: 'bbb', position: 4},
    {id: 'abab', position: 7},
    {id: 'baba', position: 6},
    {id: 'aze', position: 1},
    {id: 'rez', position: 0},
    {id: 'tre', position: 5},
    {id: 'rty', position: 2},
  ]

  list.sort((x, y) => (y.position - x.position))
  for (const l of list){
    console.log(l)
  }
/*
  getExpress() //start HTTP server (unused)
  await GetUws() //start WebSocket server

  //reset all socket ID to null
  await dataSource.manager.createQueryBuilder()
    .update(UserEntity)
    .set({socket_id: null}).execute()

  //execute cron task every hour
  cron.schedule('0 * * * *', async function() {
    await deleteOldMessages()
  })
 */
})
