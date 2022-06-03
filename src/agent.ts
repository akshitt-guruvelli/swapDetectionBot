import {
  Finding,
  FindingType,
  FindingSeverity,
  HandleTransaction,
  TransactionEvent,
  getJsonRpcUrl
} from 'forta-agent'
import{
  ethers,
  providers,
  BigNumberish
}from "ethers"

import{
  Interface,
  keccak256,
  getCreate2Address,
  defaultAbiCoder
} from "ethers/lib/utils"

export const uniswapFactoryContract="0x1F98431c8aD98523631AE4a59f267346ea31F984"

export const swapABI= "event Swap(address sender, address recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)"

let provider=new ethers.providers.JsonRpcProvider(getJsonRpcUrl());

const poolABI = [ "function token0() public view returns (address)", "function token1() public view returns (address)", "function fee() public view returns (uint24)"]

function computeCreate2Address(token0: string, token1: string, fee: BigNumberish){

  if(token0.toLowerCase()>token1.toLowerCase()){
    let temp:string=token0;
    token0=token1;
    token1=temp;
  }
  const salt = keccak256(defaultAbiCoder.encode(["string","string","uint24"],[token0,token1,fee]));
  const initCodeHash = "0xe34f199b19b2b4f47f68442619d555527d244f78a3297ea89325f843f87b8b54";

  return getCreate2Address(uniswapFactoryContract, salt, initCodeHash);
}

function getPoolAddress(tokenA: string, tokenB: string, fee: BigNumberish){
  const getPoolAbi='function getPool(address, address, uint24) public view returns (address)'
  const poolInterface=new ethers.utils.Interface([getPoolAbi]);
  const uniswapFactory=new ethers.Contract(uniswapFactoryContract,poolInterface,provider);

  let poolAddress=uniswapFactory.getPool(tokenA,tokenB,fee);

  return poolAddress;
}

function getTokens(add: string){
  const reference=new ethers.Contract(add,poolABI,provider);
  try{
    let tokenAAddress=reference.token0();
    let tokenBAddress=reference.token1();
    let fee=reference.fee();

    return [tokenAAddress,tokenBAddress,fee];
  }
  catch(err){
    console.log("error");
  }
}

export const provideHandleTransaction = (getTokens: any) : HandleTransaction => async (tx : TransactionEvent) => {
  const findings : Finding[] = []

    const swaps =await tx.filterLog(swapABI);
    //console.log(swaps);

    for(let object_ of swaps){
      const contractAddress=object_.address;

      const [tokenAAddress,tokenBAddress,fee] = getTokens(contractAddress.toLowerCase());

      if(computeCreate2Address(tokenAAddress,tokenBAddress,fee).toLowerCase()===contractAddress.toLowerCase()){
        findings.push(
          Finding.fromObject({
            name: "uniswapV3 swap",
            description: "uniswap V3 swap has taken place involving tokens ${tokenAAddress} and ${tokenBAddress}",
            alertId: "FORTA-1",
            type: FindingType.Info,
            severity: FindingSeverity.Info,
            metadata: {
              tokenAAddress,
              tokenBAddress
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
}
