'use strict'
const cryptographic = require('crypto')

/**
 * generates random string of characters i.e salt
 * @function
 * @param {number} length - Length of the random string.
 */
export const genRandomString = function (length: number): string {
  return cryptographic.randomBytes(Math.ceil(length / 2))
    .toString('hex') /** convert to hexadecimal format */
    .slice(0, length)   /** return required number of characters */
}

/**
 * hash password with sha512.
 * @function
 * @param {string} password - List of required fields.
 * @param {string} salt - Data to be validated.
 */
export const HashAndSaltSha512 = function (password: string, salt: string): { salt: string, passwordHash: string } {
  /** Hashing algorithm sha512 */
  const hash = cryptographic.createHmac('sha512', salt)
  hash.update(password)
  const value = hash.digest('hex')
  return {
    salt: salt,
    passwordHash: value
  }
}
