export const UNISWAP_FACTORY_CONTRACT =
  "0x1F98431c8aD98523631AE4a59f267346ea31F984";
export const SWAP_ABI =
  "event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)";
export const POOL_ABI = [
  "function token0() public view returns (address)",
  "function token1() public view returns (address)",
  "function fee() public view returns (uint24)",
];
export const INIT_CODE_HASH =
  "0xe34f199b19b2b4f47f68442619d555527d244f78a3297ea89325f843f87b8b54";

export const DAI_CONTRACT="0x6B175474E89094C44Da98b954EedeAC495271d0F";

export const USDC_CONTRACT="0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

export const DAI_USDC_POOL="0x5777d92f208679DB4b9778590Fa3CAB3aC9e2168";
