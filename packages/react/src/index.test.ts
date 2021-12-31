import * as Exports from './'

it('should expose correct exports', () => {
  expect(Object.keys(Exports)).toMatchInlineSnapshot(`
    [
      "Provider",
      "useContext",
      "useAccount",
      "useBalance",
      "useBlockNumber",
      "useConnect",
      "useContract",
      "useContractEvent",
      "useEnsAvatar",
      "useEnsLookup",
      "useEnsResolver",
      "useFeeData",
      "useNetwork",
      "useProvider",
      "useSignMessage",
      "useToken",
      "useWebSocketProvider",
      "Connector",
      "InjectedConnector",
      "WalletConnectConnector",
      "WalletLinkConnector",
      "chain",
      "defaultChains",
      "defaultL2Chains",
      "developmentChains",
      "erc1155ABI",
      "erc20ABI",
      "erc721ABI",
      "normalizeChainId",
    ]
  `)
})
