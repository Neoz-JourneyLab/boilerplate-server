import {dataSource} from './index'
import {MessageEntity} from './database/entity/message.entity'
import {env} from './env'
import chalk from 'chalk'

/**
 * delete all olds messages
 * distributed and not distributed don't have same archive delay
 */
export const deleteOldMessages = async () => {
  const messageTimeOut = new Date(Date.now() - 1000 * 3600 * 24 * env.MESSAGE_CONSERVATION_DAYS)
  const messageReadTimeOut = new Date(Date.now() - 1000 * 3600 * 24 * env.MESSAGE_READ_CONSERVATION_DAYS)
  console.log(chalk.rgb(150, 150, 0)`delete messages send before ${messageTimeOut.toUTCString()}`)
  console.log(chalk.rgb(150, 150, 0)`delete messages read before ${messageReadTimeOut.toUTCString()}`)

  await dataSource.manager.createQueryBuilder().delete().from(MessageEntity)
    .where('send_at < :minSendAt', {minSendAt: messageTimeOut}).execute()
  await dataSource.manager.createQueryBuilder().delete().from(MessageEntity)
    .where('send_at < :minSendAt and distributed_at is not null', {minSendAt: messageReadTimeOut}).execute()
}