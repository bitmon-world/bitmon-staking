import _ from "lodash";
import { PublicKey } from "@solana/web3.js";
import { Program, BN } from "@project-serum/anchor";
import { BaseAnchorAccount, BaseAnchorAccountManager } from "./baseAnchor";
import { U64_MAX, SEC_PER_WEEK, getNowBn } from "../utils/bn";

export const AccountType = "pool";

export interface PoolAccount {
  isInitialized: boolean;
  paused: boolean;
  userCount: number;
  tokenStakeCount: number;
  lastUpdateTime: BN;
  rewardRatePerToken: BN;
  rewardDuration: BN;
  rewardDurationEnd: BN;
  unstakeDuration: BN;
  authority: PublicKey;
  config: PublicKey;
  rewardMint: PublicKey;
  rewardVault: PublicKey;
  funders: PublicKey[];
}

export class Pool extends BaseAnchorAccount<PoolAccount> {
  get rewardEndDisplay() {
    const rewardDurationEndNum = this.data.rewardDurationEnd.toNumber();
    if (rewardDurationEndNum === 0) {
      return "";
    }
    return new Date(rewardDurationEndNum * 1000).toLocaleDateString();
  }

  getFundAmount = (
    amountPerWeek: number,
    decimals: number,
    numMints: number
  ) => {
    if (amountPerWeek === 0) {
      return new BN(0);
    }
    const now = getNowBn();
    let leftover = new BN(0);
    if (now.lt(this.data.rewardDurationEnd)) {
      const remainingDuration = this.data.rewardDurationEnd.sub(now);
      leftover = this.data.rewardRatePerToken
        .mul(remainingDuration)
        .mul(new BN(numMints))
        .div(U64_MAX);
    }
    const fundAmount = new BN(10 ** 9 * amountPerWeek)
      .mul(this.data.rewardDuration)
      .mul(new BN(numMints))
      .div(SEC_PER_WEEK)
      .sub(leftover);

    return fundAmount;
  };

  getFundAmountDisplay = (
    amountPerWeek: number,
    decimals: number,
    numMints: number
  ) => {
    const fundAmount = this.getFundAmount(amountPerWeek, 9, numMints);
    const denominator = new BN(10).pow(new BN(9));
    return fundAmount.div(denominator);
  };
}

export class PoolManager extends BaseAnchorAccountManager<PoolAccount, Pool> {
  constructor(program: Program) {
    super(program, AccountType);
  }

  isValid = (entity: any): entity is Pool => {
    return (
      entity instanceof Pool &&
      typeof entity.data.isInitialized === "boolean" &&
      typeof entity.data.paused === "boolean" &&
      typeof entity.data.userCount === "number" &&
      typeof entity.data.tokenStakeCount === "number" &&
      BN.isBN(entity.data.lastUpdateTime) &&
      BN.isBN(entity.data.rewardRatePerToken) &&
      BN.isBN(entity.data.rewardDuration) &&
      BN.isBN(entity.data.rewardDurationEnd) &&
      BN.isBN(entity.data.unstakeDuration) &&
      _.isArray(entity.data.funders)
    );
  };

  // @ts-ignore
  toDomain = async (account: any, publicKey: PublicKey) => {
    const accountData = { ...account };
    return new Pool(publicKey, accountData);
  };
}
