import { createFargateTask } from 'dcl-ops-lib/createFargateTask'
import { env, envTLD } from 'dcl-ops-lib/domain'

export = async function main() {
  const revision = process.env['CI_COMMIT_SHA']
  const image = `decentraland/atlas-server:${revision}`

  const hostname = 'atlas-api.decentraland.' + envTLD

  const atlasApi = await createFargateTask(
    `atlas-api`,
    image,
    5000,
    [
      { name: 'NODE_ENV', value: 'production' },
      {
        name: 'API_URL',
        value:
          env === 'prd' || env === 'stg'
            ? 'https://api.thegraph.com/subgraphs/name/decentraland/marketplace'
            : 'https://api.thegraph.com/subgraphs/name/decentraland/marketplace-ropsten',
      },
    ],
    hostname,
    {
      // @ts-ignore
      healthCheck: {
        path: '/ping',
        interval: 60,
        timeout: 10,
        unhealthyThreshold: 10,
        healthyThreshold: 3,
      },
      version: '1',
      memoryReservation: 1024,
    }
  )

  const publicUrl = atlasApi.endpoint

  return {
    publicUrl,
  }
}