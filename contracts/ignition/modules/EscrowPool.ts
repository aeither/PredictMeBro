import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("EscrowPoolModule", (m) => {
  const escrowPool = m.contract("EscrowPool");

  return { 
    escrowPool 
  };
});
