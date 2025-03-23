import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e"

const LockModule = buildModule("OrderTokenModule", (m) => {

  const OrderToken = m.contract("OrderToken", [], {
    // value: lockedAmount,
  });
  m.call(OrderToken, "initialize", [USDC_ADDRESS]);

  return {OrderToken };
});

export default LockModule;
