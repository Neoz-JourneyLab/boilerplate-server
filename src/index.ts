import {DataSource} from 'typeorm'
//import {getExpress} from './http/express'
import {GetUws} from './uws/uws'
import {UserEntity} from './database/entity/user.entity'
import {env} from './env'
import {deleteOldMessages} from './crons'
import {getExpress} from './http/express'
import {MessageEntity} from './database/entity/message.entity'

const cron = require("node-cron");

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
})
