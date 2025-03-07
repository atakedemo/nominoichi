import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

// const JAN_1ST_2030 = 1893456000;
// const ONE_GWEI: bigint = 1_000_000_000n;

const LockModule = buildModule("OrderNftModule", (m) => {
//   const unlockTime = m.getParameter("unlockTime", JAN_1ST_2030);
//   const lockedAmount = m.getParameter("lockedAmount", ONE_GWEI);

  const OrderNft = m.contract("OrderNft", [], {
    // value: lockedAmount,
  });
  m.call(OrderNft, "initialize", ["OrderNft", "oNFT"]);
  m.call(OrderNft, "mint", ["0x7b718D4Ce6ca83536660a314639559F3d3f6e9e3"]);

  return {OrderNft };
});

export default LockModule;
