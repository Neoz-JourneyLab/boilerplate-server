import {genRandomString} from '../../crypto/password-management'
import {tokenStore} from '../../uws/token-store'
import chalk from 'chalk'

var rsa = require('node-bignumber')

export const Autentication = async (req: any, res: any) => {
  console.log('Le client à envoyé une requettes post contenant : ', req.body)

  let e = '010001'
  let pub = new rsa.Key()
  pub.setPublic(req.body['public_rsa'], e)

  let privateToken = genRandomString(32)
  let encrypted = pub.encrypt(privateToken)
  const publicToken: string = genRandomString(32)

  tokenStore.set(privateToken, publicToken)
  console.log(chalk.rgb(150, 150, 0) `Token ${publicToken} in store.`)
  console.log(chalk.rgb(250, 20, 20) `WITH PRIVATE TOKEN ${privateToken}.`)

  res.end(JSON.stringify({response: 'auth:ok', token: encrypted, publicToken: publicToken}))
}
