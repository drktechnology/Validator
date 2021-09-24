import Web3 from 'web3'

const BigNumber = require('bignumber.js')

export const cutString = (s) => {
  if (!s) return ''
  if (s.length < 20) return s
  const first5 = s.substring(0, 5).toLowerCase()
  const last3 = s.slice(-3)
  return `${first5}...${last3}`
}

export const fromWei = (_value, decimal) => {
  const value = _value || '0'
  const s = Web3.utils.fromWei(value.toString(), 'ether')
  const rs = new BigNumber(s).toFixed(decimal)
  return rs
}

function removeSpecialChars(str) {
  return str.replace(/[^a-zA-Z ]/g, '')
}

export const getXFactor = (networkFee, accountFee) => {
  const A = new BigNumber(100 * 1e3)
  const F = new BigNumber(networkFee)
  const fa = new BigNumber(accountFee)
  const X = A.times(fa)
    .idiv(F)
    .div(100)
  return X.gt(0.5) ? '0.5' : X.toString()
}

export const getMetadata = (metadata) => {
  const firstname = Web3.utils.toAscii(metadata[0])
  const lastname = Web3.utils.toAscii(metadata[1])

  const licenseId = Web3.utils.toAscii(metadata[2])
  const fullAddress = metadata[3]

  const state = Web3.utils.toAscii(metadata[4])
  const zipcode = Web3.utils.toAscii(metadata[5])

  const expirationDate = metadata[6]
  const createdDate = metadata[7]
  const updatedDate = metadata[8]
  const minThreshold = metadata[9]

  const contactEmail = Web3.utils.toAscii(metadata[10])
  const isCompany = metadata[11]
  const str = [
    firstname,
    lastname,
    licenseId,
    fullAddress,
    state,
    zipcode,
    expirationDate,
    createdDate,
    updatedDate,
    minThreshold,
    contactEmail,
    isCompany,
  ]

  return str.join(', ').replace(/[^a-zA-Z0-9, ]/g, '')
}

export const getMetadataName = (metadata) => {
  const firstname = Web3.utils.toAscii(metadata[0])
  const lastname = Web3.utils.toAscii(metadata[1])

  const str = [firstname, lastname]

  return cutString(str.join(' ').replace(/[^a-zA-Z0-9, ]/g, ''))
}

export const updateMetadata = async (methods, wallet, metadata) => {
  const firstname = Web3.utils.fromAscii(metadata.firstname)
  const lastname = Web3.utils.fromAscii(metadata.lastname)

  const licenseId = Web3.utils.fromAscii(metadata.licenseId)
  const {fullAddress} = metadata

  const state = Web3.utils.fromAscii(metadata.state)
  const zipcode = Web3.utils.fromAscii(metadata.zipcode)

  const expirationDate = 0 // metadata.expirationDate
  const createdDate = 0 // metadata.createdDate
  const updatedDate = 0 // metadata.updatedDate
  const minThreshold = 0 // metadata.minThreshold

  const contactEmail = Web3.utils.fromAscii(metadata.contactEmail)
  const isCompany = false // metadata.isCompany

  // console.log('xxx metadata', metadata)

  return await methods
    .updateMetadata(
      firstname,
      lastname,
      licenseId,
      fullAddress,
      state,
      zipcode,
      expirationDate,
      createdDate,
      updatedDate,
      minThreshold,
      contactEmail,
      isCompany
    )
    .send({ from: wallet })
  // bytes32 _firstName,
  // bytes32 _lastName,
  // bytes32 _licenseId,
  // string memory _fullAddress,
  // bytes32 _state,
  // bytes32 _zipcode,
  // uint256 _expirationDate,
  // uint256 _createdDate,
  // uint256 _updatedDate,
  // uint256 _minThreshold,
  // bytes32 _contactEmail,
  // bool _isCompany
}

export const formatNumber = (num, fraction) => {
  return (num || 0).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: fraction || 0,
  })
}
