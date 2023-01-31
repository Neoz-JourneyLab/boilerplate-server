import {tokenStore} from '../../uws/token-store'

export const TestCrypto = async (req: any, _res: any) => {
  let token: number[] = tokenStore.getByClient(req.body['publicToken'])
  //let bytesToken: number[] = utf8ToBytes(privateToken)
  console.log('encrypted data : ', req.body['text'])
  let bytes = hexToBytes(req.body['text'])
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = bytes[i] ^ token[i % token.length]
  }
  console.log('decrypted data : ', bytesToString(bytes))
}

function hexToBytes(hex: string) {
  let bytes = []
  for (let c = 0; c < hex.length; c += 2) {
    bytes.push(parseInt(hex.substr(c, 2), 16))
  }
  return bytes
}


function bytesToString(byteArray: any) {
  let str = ''
  for (let i = 0; i < byteArray.length; i++)
    str += byteArray[i] <= 0x7F ?
      byteArray[i] === 0x25 ? '%25' : // %
        String.fromCharCode(byteArray[i]) :
      '%' + byteArray[i].toString(16).toUpperCase()
  return decodeURIComponent(str)
}