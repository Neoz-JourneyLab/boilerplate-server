export const Test = async (req: any, res: any) => {
  console.log('Le client à envoyé une requettes post contenant : ', req.body)
  console.log('Je vais lui répondre : ', {test: 'Response is ok :)'})
  res.end(JSON.stringify({test: 'Response is ok :)'}))
}
