import { Image, Text, VStack } from "@chakra-ui/react";
import { PublicKey } from "@solana/web3.js";
import { TrainerAccount, TrainerStakeStatus } from "../hooks/useNftAccounts";
import { Pool } from "../models/pool";
import { UnstakeProof } from "../models/unstakeProof";

const StakeStatusText = ({
  stakeStatus,
}: {
  stakeStatus: TrainerStakeStatus;
}) => {
  let text: string;
  let color: string;
  switch (stakeStatus) {
    case TrainerStakeStatus.UNSTAKED:
      color = "brandPink.900";
      text = "Unstaked";
      break;
    case TrainerStakeStatus.STAKED:
      color = "green.500";
      text = "Staked";
      break;
    case TrainerStakeStatus.PENDING:
      color = "yellow.500";
      text = "Unstaking...";
      break;
    case TrainerStakeStatus.WITHDRAW:
      color = "red.500";
      text = "Withdrawable";
      break;
    default:
      color = "gray.500";
      text = "...";
      break;
  }

  return (
    <Text color={color} fontWeight={"bold"}>
      {text}
    </Text>
  );
};

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
      backgroundColor="gray.200"
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
    </VStack>
  );
};

export default NftCard;
