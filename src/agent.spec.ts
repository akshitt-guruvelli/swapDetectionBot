import {
  FindingType,
  FindingSeverity,
  Finding,
  HandleTransaction,
  createTransactionEvent,
  ethers,
} from "forta-agent";
import agent, {
  provideHandleTransaction,
  computeCreate2Address
} from "./agent";
import{
  DAI_CONTRACT,
  USDC_CONTRACT,
  DAI_USDC_POOL,
  SWAP_ABI
} from "./utils";
import{
  BigNumberish
} from 'ethers';
import { getCreate2Address, defaultAbiCoder, keccak256, Interface } from "ethers/lib/utils";
import{
  createAddress,
  TestTransactionEvent
} from 'forta-agent-tools/lib/tests';
import {when} from 'jest-when';

function createFinding(contractAddress:string,tokenAAddress:string,tokenBAddress:string,fee:any){
  Finding.fromObject({
    name: "uniswapV3 swap",
    description:
      "uniswap V3 swap has taken place involving tokens ${tokenAAddress} and ${tokenBAddress}",
    alertId: "FORTA-1",
    type: FindingType.Info,
    severity: FindingSeverity.Info,
    metadata: {
      contractAddress,
      tokenAAddress,
      tokenBAddress,
      fee
    },
  })
}


describe("detect uniswap swaps", () => {
  let handleTransaction: HandleTransaction;
  const mocker=jest.fn();

  beforeAll(() => {
    handleTransaction = provideHandleTransaction(mocker);
    mocker.mockClear();
  });

  describe("handleTransaction", () => {
    it("returns empty findings if there are no swaps", async () => {

      const txEvent = new TestTransactionEvent().setFrom("0x11").setTo("0x22");
      const findings = await handleTransaction(txEvent);
      expect(findings).toEqual([]);
    });
    /*it("returns a finding if there is a swap event emitted by pool contract", async () => {

      when(mocker).calledWith(createAddress(DAI_USDC_POOL)).mockReturnValue([DAI_CONTRACT,USDC_CONTRACT,100]);
      const txEvent = new TestTransactionEvent().setFrom("0x11");
      const eventInterface=new Interface([SWAP_ABI]);
      const event = eventInterface.getEvent("Swap");
      const mimic=eventInterface.encodeEventLog(event, [createAddress("0xabc"),createAddress("0xcba"),"0x78","0x98","0x56","0x789","123"]);
      const findings = await handleTransaction(txEvent);
      expect(findings).toEqual([createFinding(computeCreate2Address(DAI_CONTRACT,USDC_CONTRACT,100),DAI_CONTRACT,USDC_CONTRACT,100)]);*/
  })
});
