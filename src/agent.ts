import {
  Finding,
  FindingType,
  FindingSeverity,
  HandleTransaction,
  TransactionEvent,
  getJsonRpcUrl,
} from "forta-agent";
import { ethers, providers, BigNumberish } from "ethers";
import {
  Interface,
  keccak256,
  getCreate2Address,
  defaultAbiCoder,
} from "ethers/lib/utils";
import {
  UNISWAP_FACTORY_CONTRACT,
  SWAP_ABI,
  POOL_ABI,
  INIT_CODE_HASH,
} from "./utils";

let provider = new ethers.providers.JsonRpcProvider(getJsonRpcUrl());

export function computeCreate2Address(
  token0: string,
  token1: string,
  fee: BigNumberish
) {
  if (token0.toLowerCase() > token1.toLowerCase()) {
    let temp: string = token0;
    token0 = token1;
    token1 = temp;
  }
  const salt = keccak256(
    defaultAbiCoder.encode(
      ["string", "string", "uint24"],
      [token0, token1, fee]
    )
  );
  return getCreate2Address(UNISWAP_FACTORY_CONTRACT, salt, INIT_CODE_HASH);
}

function getPoolAddress(tokenA: string, tokenB: string, fee: BigNumberish) {
  const getPoolAbi =
    "function getPool(address, address, uint24) public view returns (address)";
  const poolInterface = new ethers.utils.Interface([getPoolAbi]);
  const uniswapFactory = new ethers.Contract(
    UNISWAP_FACTORY_CONTRACT,
    poolInterface,
    provider
  );

  let poolAddress = uniswapFactory.getPool(tokenA, tokenB, fee);

  return poolAddress;
}

function getTokens(add: string) {
  const reference = new ethers.Contract(add, POOL_ABI, provider);
  let tokenAAddress = "";
  let tokenBAddress = "";
  let fee = "";
  try {
    tokenAAddress = reference.token0();
    tokenBAddress = reference.token1();
    fee = reference.fee();

    return [tokenAAddress, tokenBAddress, fee];
  } catch (err) {
    console.log("error");
    return [tokenAAddress, tokenBAddress, fee];
  }
}

export const provideHandleTransaction =
  (getTokens: any): HandleTransaction =>
  async (tx: TransactionEvent) => {
    const findings: Finding[] = [];

    console.log("before");
    const swaps = await tx.filterLog(SWAP_ABI);
    console.log("after");
    console.log(swaps);

    for (let object of swaps) {
      const contractAddress = object.address;

      const [tokenAAddress, tokenBAddress, fee] = getTokens(
        contractAddress.toLowerCase()
      );

      if (
        computeCreate2Address(
          tokenAAddress,
          tokenBAddress,
          fee
        ).toLowerCase() === contractAddress.toLowerCase()
      ) {
        findings.push(
          Finding.fromObject({
            name: "uniswapV3 swap",
            description:
              "uniswap V3 swap has taken place involving tokens ${tokenAAddress} and ${tokenBAddress}",
            alertId: "FORTA-1",
            type: FindingType.Info,
            severity: FindingSeverity.Info,
            metadata: {
              tokenAAddress,
              tokenBAddress,
            },
          })
        );
      }
    }
    console.log(findings);
    return findings;
  };

export default {
  handleTransaction: provideHandleTransaction(getTokens),
};
