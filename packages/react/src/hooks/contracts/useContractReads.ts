import * as React from 'react'
import { hashQueryKey, useQueryClient } from 'react-query'
import {
  ReadContractsConfig,
  ReadContractsResult,
  readContracts,
  watchReadContracts,
} from '@wagmi/core'

import { QueryConfig, QueryFunctionArgs } from '../../types'
import { useBlockNumber } from '../network-status'
import { useChainId, useQuery } from '../utils'
import { parseContractResult } from '../../utils'

export type UseContractReadsConfig = QueryConfig<ReadContractsResult, Error> &
  ReadContractsConfig & {
    /** If set to `true`, the cache will depend on the block number */
    cacheOnBlock?: boolean
    /** Subscribe to changes */
    watch?: boolean
  }

export const queryKey = ([
  { allowFailure, contracts, overrides },
  { blockNumber, chainId },
]: [ReadContractsConfig, { blockNumber?: number; chainId?: number }]) =>
  [
    {
      entity: 'readContracts',
      allowFailure,
      blockNumber,
      chainId,
      contracts,
      overrides,
    },
  ] as const

const queryKeyHashFn = ([queryKey_]: ReturnType<typeof queryKey>) => {
  const { contracts, ...rest } = queryKey_
  const contracts_ = contracts?.map((contract) => {
    // Exclude the contract interface from the serialized query key.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { contractInterface, ...rest } = contract
    return rest
  })
  return hashQueryKey([{ contracts: contracts_, ...rest }])
}

const queryFn = ({
  queryKey: [{ allowFailure, contracts, overrides }],
}: QueryFunctionArgs<typeof queryKey>) => {
  return readContracts({
    allowFailure,
    contracts,
    overrides,
  })
}

export function useContractReads({
  allowFailure = true,
  cacheOnBlock = false,
  cacheTime,
  contracts,
  overrides,
  enabled: enabled_ = true,
  keepPreviousData,
  onError,
  onSettled,
  onSuccess,
  select,
  staleTime,
  suspense,
  watch,
}: UseContractReadsConfig) {
  const { data: blockNumber } = useBlockNumber({
    enabled: watch || cacheOnBlock,
    watch,
  })
  const chainId = useChainId()

  const queryKey_ = React.useMemo(
    () =>
      queryKey([
        { allowFailure, contracts, overrides },
        { blockNumber: cacheOnBlock ? blockNumber : undefined, chainId },
      ]),
    [allowFailure, blockNumber, cacheOnBlock, chainId, contracts, overrides],
  )

  const enabled = React.useMemo(() => {
    let enabled = Boolean(enabled_ && contracts.length > 0)
    if (cacheOnBlock) enabled = Boolean(enabled && blockNumber)
    return enabled
  }, [blockNumber, cacheOnBlock, contracts, enabled_])

  const client = useQueryClient()
  React.useEffect(() => {
    if (enabled) {
      const unwatch = watchReadContracts(
        {
          contracts,
          overrides,
          listenToBlock: watch && !cacheOnBlock,
        },
        (result) => client.setQueryData(queryKey_, result),
      )
      return unwatch
    }
  }, [cacheOnBlock, client, contracts, enabled, overrides, queryKey_, watch])

  return useQuery(queryKey_, queryFn, {
    cacheTime,
    enabled,
    keepPreviousData,
    queryKeyHashFn,
    staleTime,
    select: (data) => {
      const result = data.map((data, i) =>
        contracts[i]
          ? parseContractResult({
              contractInterface: (<typeof contracts[number]>contracts[i])
                ?.contractInterface,
              functionName: (<typeof contracts[number]>contracts[i])
                ?.functionName,
              data,
            })
          : data,
      )
      return select ? select(result) : result
    },
    suspense,
    onError,
    onSettled,
    onSuccess,
  })
}
