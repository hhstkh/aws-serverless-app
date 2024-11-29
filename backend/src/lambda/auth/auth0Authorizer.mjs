import jsonwebtoken from 'jsonwebtoken'

const certificate = `-----BEGIN CERTIFICATE-----
MIIDHTCCAgWgAwIBAgIJQvDQP83/vIX8MA0GCSqGSIb3DQEBCwUAMCwxKjAoBgNV
BAMTIWRldi15Mmtrd2JjNzA2ZWpldmx2LnVzLmF1dGgwLmNvbTAeFw0yNDExMTcx
MzMxMjVaFw0zODA3MjcxMzMxMjVaMCwxKjAoBgNVBAMTIWRldi15Mmtrd2JjNzA2
ZWpldmx2LnVzLmF1dGgwLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC
ggEBAOehlmQGWPLqy0uuO4yMQyHYurR7LZkLIgeYj0GquOM18eM5GjaOwKPw6JUI
3oKXf6kMpei+zFp9xJtrfkeLePCW1pbfwokQnU0T21WGP3c9l2k928jf4d4UCEjM
v4Qz5URfDGk1tuGPpXYZd272BAY4dIEksAtknj6+Gg7QUNy9/MhAxPSM/0qnHVVo
ZqB/So0O3lCXlaVPZSl6ZlXCE/7GKkJOvtHdypk+KClX6AMoSQ8CNV67NmYrPEk1
C7RhGEegAVNDNYL5TP9aY8JQmQe5rC14FH1Y1eQ7uGMPUlyWEz+Vaeb5fR+lFZ6g
Hp1v3uryhQw35jreCMIpKStdmQECAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAd
BgNVHQ4EFgQUkR0bk5i6cxdfO/hl7oRE3qD3hcYwDgYDVR0PAQH/BAQDAgKEMA0G
CSqGSIb3DQEBCwUAA4IBAQBQOVZV49s2OoTKdrFfG9d//rUNf5iEPEvS3qcJZTgr
slJNj6SY4PyHPSAFDFcvmzjeRQoBuv3mBGsO23peSJHd2pvfQ6vAfUuiPYTsqmt5
aJXdajc8u8+sGfqx9PXEi2gjh5UWEmHhl6U+sxjFbId1K7mwudA9FT0lz7GJH41V
KOt6sxU3C7AVg1xacpy5hBNPRwh8eNh2YL74gowKbQImdPL/N4E352EfHHNmCjNL
vh9R4VUhW8qZnwjcYF78kQzKsKEaoLkEhQsJcz/x54nSUimNX+HG2kSrN8aT7YGg
RQTcTPdLfJBaOfZyeqMd50hBWtPnlYE7WZP1Lo1jVG4k
-----END CERTIFICATE-----`

export async function handler(event) {
  try {
    console.log('Authorized token: ', event.authorizationToken)
    const jwtToken = verifyToken(event.authorizationToken)
    console.log('User was authorized: ', jwtToken)

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    console.log('User was not authorized', e)

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

function verifyToken(authHeader) {
  if (!authHeader) throw new Error('No authorization header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authorization header')

  const split = authHeader.split(' ')
  const token = split[1]

  return jsonwebtoken.verify(token, certificate, { algorithms: ['RS256'] })
}
