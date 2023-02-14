import {listenersStore} from '../listeners-store'
import {Client} from '../client'
import {UserEntity} from '../../database/entity/user.entity'
import {v4} from 'uuid'
import {dataSource} from '../../index'
import {genRandomString, HashAndSaltSha512} from '../../crypto/password-management'
import chalk from 'chalk'

/**
 * authenticate user with hashed password, nickname and public RSA key
 */
listenersStore.on('auth', async (client: Client, data: { nickname: string, password: string, public_rsa: string }) => {
  //get user from it's nickname
  const user: UserEntity | null = await dataSource.manager
    .getRepository(UserEntity)
    .findOneBy({nickname: data.nickname})

  //check if min length is valid
  if (data.password.length < 5 || data.nickname.length < 4) {
    console.log(chalk.red(`try to log with impossible data: ${data.nickname} / ${data.password}`))
    client.emit('auth:error', {message: '002:PASSWORD OR NICKNAME INVALID LEN'})
    return
  }

  //if not user found, create a new one
  if (!user) {
    const salt: string = genRandomString(16)
    const uuid: string = v4()
    await dataSource.manager.createQueryBuilder()
      .insert().into(UserEntity)
      .values({
        nickname: data.nickname,
        id: uuid,
        //create a salt for randomise similar hash
        password: HashAndSaltSha512(data.password, salt).passwordHash,
        salt: salt,
        default_public_rsa: data.public_rsa,
        socket_id: client.socketId
      }).execute()

    console.log('No user found for that account name, one was created.')
    console.log(chalk.hex('#FFFF00')`Password hash : ${data.password.substr(0, 10)}.`)
    console.log(chalk.hex('#7FFF00')`Salt : ${salt}.`)
    console.log(chalk.hex('#007FFF')`Result : ${HashAndSaltSha512(data.password, salt).passwordHash}.`)

    client.emit('auth:response', {user_id: uuid, message: 'Account created with success !'})
    return
  }


  //if password if incorrect
  if (user.password != HashAndSaltSha512(data.password, user.salt).passwordHash) {
    console.log(chalk.red('Invalid password from user.'))
    client.emit('auth:error', {message: '000:INVALID PASSWORD'})
    return
  }

  //if rsa public key is not the same
  if (user.default_public_rsa != data.public_rsa) {
    console.log(chalk.red('Invalid RSA public from user.'))
    client.emit('auth:error', {message: '001:INVALID RSA KEY'})
    return
  }

  console.log(chalk.green(`Account ${user.nickname} authenticated. Socket-ID ${client.socketId}`))

  //set socket id in database
  await dataSource.manager.createQueryBuilder()
    .update(UserEntity).set({socket_id: client.socketId})
    .where('id = :id', {id: user.id})
    .execute()

  //notify user that all was ok
  client.emit('auth:response', {
    user_id: user.id,
    message: 'Authentication success !'
  })
})
