export class TokenStore {
  private store: Map<string, number[]> = new Map<string, number[]>()

  public set(privateToken: string, publicToken: string) {
    this.store.set(publicToken, utf8ToBytes(privateToken))
  }

  public getByClient(client: string | null): number[] {
    if(!client) {
      throw new Error('client is null')
    }

    if(!this.store.has(client)) {
      console.log('no token found for ', client)
      throw new Error('client not found')
    }

    return <number[]>this.store.get(client)
  }

  public getMap(): Map<string, number[]> {
    return this.store
  }
}

export const tokenStore: TokenStore = new TokenStore()

function utf8ToBytes(str: string) {
  var ch, st, re: any[] = []
  for (var i = 0; i < str.length; i++) {
    ch = str.charCodeAt(i)  // get char
    st = []                 // set up "stack"
    do {
      st.push(ch & 0xFF)  // push byte to stack
      ch = ch >> 8          // shift value down by 1 byte
    }
    while (ch)
    // add stack contents to result
    // done because chars have "wrong" endianness
    re = re.concat(st.reverse())
  }
  // return an array of bytes
  return re
}
