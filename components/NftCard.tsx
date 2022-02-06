import { Image, Text, VStack } from "@chakra-ui/react";
import { PublicKey } from "@solana/web3.js";
import { TrainerAccount, TrainerStakeStatus } from "../hooks/useNftAccounts";
import { Pool } from "../models/pool";
import { UnstakeProof } from "../models/unstakeProof";
import { getNowBn } from "../utils/bn";
import BN from "bn.js";

const StakeStatusText = ({
  stakeStatus,
}: {
  stakeStatus: TrainerStakeStatus;
}) => {
  let text: string;
  let color: string;
  switch (stakeStatus) {
    case TrainerStakeStatus.UNSTAKED:
      color = "blue";
      text = "Unstaked";
      break;
    case TrainerStakeStatus.STAKED:
      color = "green";
      text = "Staked";
      break;
    case TrainerStakeStatus.PENDING:
      color = "orange";
      text = "Unstaking...";
      break;
    case TrainerStakeStatus.WITHDRAW:
      color = "blue";
      text = "Withdrawable";
      break;
    default:
      color = "light-green";
      text = "...";
      break;
  }

  return (
    <Text color={color} fontWeight={"bold"}>
      {text}
    </Text>
  );
};

function calcMissingTime(targetTime: any) {
  const now = getNowBn();
  const s = targetTime.sub(now).toNumber();
  return secondsToDhms(s);
}

function secondsToDhms(seconds: number) {
  seconds = Number(seconds);
  let d = Math.floor(seconds / (3600 * 24));
  let h = Math.floor((seconds % (3600 * 24)) / 3600);
  let m = Math.floor((seconds % 3600) / 60);
  let s = Math.floor(seconds % 60);
  let dDisplay = d > 0 ? d + (d == 1 ? " day " : " days ") : "";
  let hDisplay = h > 0 ? h + (h == 1 ? " hour " : " hours ") : "";
  let mDisplay = m > 0 ? m + (m == 1 ? " minute " : " minutes ") : "";
  let sDisplay = s > 0 && d === 0 ? s + (s == 1 ? " second" : " seconds") : "";
  return dDisplay + hDisplay + mDisplay + sDisplay;
}

const NftCard = ({
  walletPublicKey,
  pool,
  trainerAccount,
  onClick,
  unstakeProof,
}: {
  walletPublicKey: PublicKey;
  pool: Pool;
  trainerAccount: TrainerAccount;
  onClick: (trainerAccount: TrainerAccount) => void;
  unstakeProof?: UnstakeProof;
}) => {
  return (
    <VStack
      onClick={onClick.bind(null, trainerAccount)}
      p="4"
      cursor="pointer"
      backgroundColor="white"
      borderRadius="lg"
      boxShadow="md"
      _hover={{
        opacity: "0.8",
      }}
    >
      <Image
        alt="selected nft"
        w="36"
        objectFit="cover"
        boxShadow="md"
        borderRadius="lg"
        src={trainerAccount.staticData.image}
      />
      <Text fontWeight={"bold"}>{trainerAccount.staticData.name}</Text>
      <StakeStatusText
        stakeStatus={trainerAccount.getStakeStatus(
          walletPublicKey,
          pool.data.unstakeDuration,
          unstakeProof?.data.unstakeTimestamp
        )}
      />
      {trainerAccount.getStakeStatus(
        walletPublicKey,
        pool.data.unstakeDuration,
        unstakeProof?.data.unstakeTimestamp
      ) === TrainerStakeStatus.PENDING ? (
        <Text>
          <p>You still need to wait</p>
          <p>
            {calcMissingTime(
              unstakeProof?.data.unstakeTimestamp.add(pool.data.unstakeDuration)
            )}
          </p>
        </Text>
      ) : (
        <div />
      )}
    </VStack>
  );
};

export default NftCard;
