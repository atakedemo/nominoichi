import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e"

const LockModule = buildModule("OrderNftModule", (m) => {

  const OrderNft = m.contract("OrderNft", [], {
    // value: lockedAmount,
  });
  m.call(OrderNft, "initialize", [USDC_ADDRESS]);

  return {OrderNft };
});

export default LockModule;
