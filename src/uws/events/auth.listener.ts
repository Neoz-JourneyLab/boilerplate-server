import {listenersStore} from '../listeners-store'
import {Client} from '../client'
import {UserEntity} from '../../database/entity/user.entity'
import {v4} from 'uuid'
import {dataSource} from '../../index'
import {genRandomString, HashAndSaltSha512} from '../../crypto/password-management'
import chalk from 'chalk'

listenersStore.on('auth', async (client: Client, data: { nickname: string, password: string, public_rsa: string }) => {
  try {
    const user: UserEntity | null = await dataSource.manager
      .getRepository(UserEntity)
      .findOneBy({nickname: data.nickname})

    if(data.password.length < 5 || data.nickname.length < 4){
      console.log(chalk.red(`try to log with impossible data: ${data.nickname} / ${data.password}`))
      client.emit('auth:error', {message: '002:PASSWORD OR NICKNAME INVALID LEN'})
      return
    }

    if (!user) {
      const salt: string = genRandomString(16)
      console.log('creating new account !')
      const uuid: string = v4()
      await dataSource.manager.createQueryBuilder()
        .insert().into(UserEntity)
        .values({
          nickname: data.nickname,
          id: uuid,
          password: HashAndSaltSha512(data.password, salt).passwordHash,
          salt: salt,
          default_public_rsa: data.public_rsa,
          socket_id: client.socketId
        }).execute()

      console.log('No user found for that account name, created.')
      console.log(chalk.hex('#FFFF00')`Password : ${data.password}.`)
      console.log(chalk.hex('#7FFF00')`Salt : ${salt}.`)
      console.log(chalk.hex('#007FFF')`Result : ${HashAndSaltSha512(data.password, salt).passwordHash}.`)

      client.emit('auth:response',
        {user_id: uuid, message: 'Account created with success !'})
      return
    }


    if (user.password != HashAndSaltSha512(data.password, user.salt).passwordHash) {
      console.log(chalk.red('Invalid password from user.'))
      client.emit('auth:error', {message: '000:INVALID PASSWORD'})
      return
    }

    if (user.default_public_rsa != data.public_rsa) {
      console.log(chalk.red('Invalid RSA public from user.'))
      client.emit('auth:error', {message: '001:INVALID RSA KEY'})
      return
    }

    console.log(chalk.green(`Account ${user.nickname} found. SID ${client.socketId}`))

    await dataSource.manager.createQueryBuilder()
      .update(UserEntity).set({socket_id: client.socketId})
      .where('id = :id', {id: user.id})
      .execute()

    client.emit('auth:response', {
      user_id: user.id,
      message: 'Authentication success !'
    })
  } catch (err) {
    client.emit('auth:error', {message: ('00X:' + err as string)})
  }
})
