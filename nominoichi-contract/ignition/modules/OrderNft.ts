import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e"

const LockModule = buildModule("OrderNftModule", (m) => {

  const OrderNft = m.contract("OrderNft", [], {
    // value: lockedAmount,
  });
  m.call(OrderNft, "initialize", [USDC_ADDRESS]);
  m.call(OrderNft, "mint", ["0x7b718D4Ce6ca83536660a314639559F3d3f6e9e3", 1]);

  return {OrderNft };
});

export default LockModule;
