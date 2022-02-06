import _ from "lodash";
import { Button, Heading, Image, Text, Flex } from "@chakra-ui/react";
import { PublicKey } from "@solana/web3.js";
import { Center, VStack, HStack, Box } from "@chakra-ui/layout";
import {
  useTrainersAccounts,
  TrainerAccount,
  useNftAccounts,
} from "../hooks/useNftAccounts";
import useWalletPublicKey from "../hooks/useWalletPublicKey";
import StakingModal from "../components/StakingModal";
import { useState, useMemo } from "react";
import useTxCallback from "../hooks/useTxCallback";
import { useCallback } from "react";
import { useAnchorAccountCache } from "../contexts/AnchorAccountsCacheProvider";
import stakeNft from "../solana/scripts/stakeNft";
import unstakeNft from "../solana/scripts/unstakeNft";
import beginUnstakeNft from "../solana/scripts/beginUnstakeNft";
import claimReward from "../solana/scripts/claimReward";
import {
  useUnstakeProofAddresses,
  useUserAccountAddress,
} from "../hooks/useSeedAddress";
import { useAccount, useAccounts } from "../hooks/useAccounts";
import { getClusterConstants } from "../constants";
import UnstakingModal from "../components/UnstakingModal";
import NftCard from "../components/NftCard";
import { UnstakeProof } from "../models/unstakeProof";
import { useTokenRegistry } from "../hooks/useTokenRegistry";
import { fromRawAmount } from "../solana/tokenConversion";

enum PAGE_TABS {
  STAKE,
  UNSTAKE,
  CLAIM,
}

const ManagePoolPage = () => {
  const walletPublicKey = useWalletPublicKey();
  const anchorAccountCache = useAnchorAccountCache();

  const { ADDRESS_STAKING_POOL } = getClusterConstants("ADDRESS_STAKING_POOL");
  const [pool] = useAccount("pool", ADDRESS_STAKING_POOL);

  const [selectedTab, setSelectedTab] = useState<PAGE_TABS>(PAGE_TABS.STAKE);

  const userAccountAddress = useUserAccountAddress(walletPublicKey);
  const [userAccount] = useAccount("user", userAccountAddress);
  const [mintStakedAccount] = useAccount(
    "mintStaked",
    userAccount?.data.mintStaked
  );

  const tokenRegistry = useTokenRegistry();

  // STAKE
  const nftAccounts = useNftAccounts(walletPublicKey);
  const trainersAccounts = useTrainersAccounts(nftAccounts);
  const [selectedTrainer, setSelectedTrainer] = useState<
    TrainerAccount | undefined
  >();

  const _stakeNftClickHandler = useCallback(async () => {
    if (!anchorAccountCache.isEnabled || !walletPublicKey || !selectedTrainer) {
      throw new Error("Invalid data");
    }

    await stakeNft(
      anchorAccountCache,
      walletPublicKey,
      selectedTrainer.tokenAccount.publicKey
    );
    setSelectedTrainer(undefined);
  }, [
    anchorAccountCache.isEnabled,
    walletPublicKey?.toString(),
    selectedTrainer,
  ]);

  const stakeNftClickHandler = useTxCallback(_stakeNftClickHandler, {
    info: "Stake NFT...",
    success: "NFT Staked!",
    error: "Transaction failed",
  });

  // UNSTAKE
  const [stakedNftAccounts] = useAccounts(
    "hTokenAccount",
    mintStakedAccount?.data.mintAccounts
  );

  const stakedTrainersAccounts = useTrainersAccounts(stakedNftAccounts);

  const stakedMints = useMemo(() => {
    return _.map(
      stakedTrainersAccounts,
      (trainerAccount) =>
        new PublicKey(trainerAccount.metaplexMetadata.data.mint)
    );
  }, [stakedTrainersAccounts]);

  const unstakeProofAddresses = useUnstakeProofAddresses(
    userAccount?.publicKey,
    stakedMints
  );

  const unstakeProffAddressesVal = useMemo(() => {
    return _.values(unstakeProofAddresses);
  }, [unstakeProofAddresses]);

  const [unstakeProofs] = useAccounts(
    "unstakeProof",
    unstakeProffAddressesVal,
    { subscribe: true }
  );

  const _unstakeNftClickHandler = useCallback(async () => {
    if (!anchorAccountCache.isEnabled || !walletPublicKey || !selectedTrainer) {
      throw new Error("Invalid data");
    }

    await unstakeNft(
      anchorAccountCache,
      walletPublicKey,
      selectedTrainer.tokenAccount.publicKey
    );
    setSelectedTrainer(undefined);
  }, [
    anchorAccountCache.isEnabled,
    walletPublicKey?.toString(),
    selectedTrainer,
  ]);

  const unstakeNftClickHandler = useTxCallback(_unstakeNftClickHandler, {
    info: "Unstake NFT...",
    success: "NFT Unstaked!",
    error: "Transaction failed",
  });

  const _beginUnstakeNftClickHandler = useCallback(async () => {
    if (!anchorAccountCache.isEnabled || !walletPublicKey || !selectedTrainer) {
      throw new Error("Invalid data");
    }

    await beginUnstakeNft(
      anchorAccountCache,
      walletPublicKey,
      selectedTrainer.tokenAccount.publicKey
    );
    setSelectedTrainer(undefined);
  }, [
    anchorAccountCache.isEnabled,
    walletPublicKey?.toString(),
    selectedTrainer,
  ]);

  const beginUnstakeNftClickHandler = useTxCallback(
    _beginUnstakeNftClickHandler,
    {
      info: "Begin Unstaking NFT...",
      success: "Unstake Started!",
      error: "Transaction failed",
    }
  );

  // CLAIM
  const rewardToken = useMemo(() => {
    if (!tokenRegistry || !pool) {
      return;
    }
    return tokenRegistry[pool.data.rewardMint.toString()];
  }, [pool, tokenRegistry]);

  const _claimRewardClickHandler = useCallback(async () => {
    if (!anchorAccountCache.isEnabled || !walletPublicKey) {
      throw new Error("Invalid data");
    }
    await claimReward(anchorAccountCache, walletPublicKey);
  }, [anchorAccountCache, walletPublicKey]);

  const claimRewardClickHandler = useTxCallback(_claimRewardClickHandler, {
    info: "Claiming BIT...",
    success: "BIT claimed!",
    error: "Transaction failed",
  });

  const selectedUnstakeProof = useMemo(() => {
    if (
      !unstakeProofAddresses ||
      !unstakeProofs ||
      !selectedTrainer ||
      selectedTab === PAGE_TABS.STAKE
    ) {
      return;
    }
    const unstakeProofAddress =
      unstakeProofAddresses[selectedTrainer.metaplexMetadata.data.mint];
    return unstakeProofs[unstakeProofAddress.toString()];
  }, [_.size(unstakeProofAddresses), _.size(unstakeProofs), selectedTrainer]);

  return (
    <Box>
      <StakingModal
        isOpen={selectedTab === PAGE_TABS.STAKE && !!selectedTrainer}
        pool={pool}
        selectedTrainer={selectedTrainer}
        onClose={setSelectedTrainer.bind(null, undefined)}
        onSubmit={stakeNftClickHandler}
      />
      <UnstakingModal
        isOpen={selectedTab === PAGE_TABS.UNSTAKE && !!selectedTrainer}
        walletPublicKey={walletPublicKey}
        pool={pool}
        unstakeProof={selectedUnstakeProof}
        selectedTrainer={selectedTrainer}
        onClose={setSelectedTrainer.bind(null, undefined)}
        beginUnstake={beginUnstakeNftClickHandler}
        unstake={unstakeNftClickHandler}
      />
      <VStack w="full" spacing={16} textAlign="center">
        <Heading color="white" fontFamily="T1">
          Trainer Staking!
        </Heading>
        <HStack spacing="8">
          <Button
            w="48"
            color="black"
            size={"md"}
            onClick={setSelectedTab.bind(null, PAGE_TABS.STAKE)}
            backgroundColor={
              selectedTab === PAGE_TABS.STAKE ? "light-green" : "green"
            }
          >
            My Trainers
          </Button>
          <Button
            w="48"
            color="black"
            size={"md"}
            onClick={setSelectedTab.bind(null, PAGE_TABS.UNSTAKE)}
            backgroundColor={
              selectedTab === PAGE_TABS.UNSTAKE ? "light-green" : "green"
            }
          >
            Staked Trainers
          </Button>
          <Button
            w="48"
            color="black"
            size={"md"}
            onClick={setSelectedTab.bind(null, PAGE_TABS.CLAIM)}
            backgroundColor={
              selectedTab === PAGE_TABS.CLAIM ? "light-green" : "green"
            }
          >
            Claim BIT
          </Button>
        </HStack>

        {selectedTab === PAGE_TABS.STAKE &&
          (walletPublicKey && pool && trainersAccounts ? (
            <VStack>
              <VStack background="white">
                <Text color="red" padding="10px">
                  <p>
                    <b>Staking your Trainer will lock them to receive $BIT.</b>
                  </p>
                  <p>
                    <b>
                      You won&apos;t be able to use them until you unstake them and
                      wait for a 7 days lock period.
                    </b>
                  </p>
                </Text>
              </VStack>
              <Text color="white">(Click to stake)</Text>
              <Center w="120" flexWrap={"wrap"}>
                {_.map(trainersAccounts, (trainerAccount, key) => {
                  return (
                    <Box key={key} m="4">
                      <NftCard
                        walletPublicKey={walletPublicKey}
                        pool={pool}
                        trainerAccount={trainerAccount}
                        onClick={setSelectedTrainer}
                      />
                    </Box>
                  );
                })}
              </Center>
            </VStack>
          ) : (
            <VStack>
              <Text fontFamily="T1" color="white">
                No trainers found
              </Text>
            </VStack>
          ))}

        {selectedTab === PAGE_TABS.UNSTAKE &&
          (walletPublicKey && pool && userAccount && stakedTrainersAccounts ? (
            <VStack>
              <VStack background="white">
                <Text color="red" padding="10px">
                  <p>
                    <b>
                      Unstaking your Trainer will result in a lock period of 7
                      days without receiving $BIT.{" "}
                    </b>
                  </p>
                  <p>
                    <b>
                      You will be able to unlock your trainer after 7 days you
                      put them to unstake.
                    </b>
                  </p>
                </Text>
              </VStack>
              <Text color="white">(Click to unstake)</Text>
              <Center w="120" flexWrap={"wrap"}>
                {_.map(stakedTrainersAccounts, (trainerAccount, key) => {
                  let unstakeProof: UnstakeProof | undefined;
                  if (unstakeProofAddresses && unstakeProofs) {
                    const unstakeProofAddress =
                      unstakeProofAddresses[
                        trainerAccount.metaplexMetadata.data.mint
                      ];
                    unstakeProof =
                      unstakeProofs[unstakeProofAddress.toString()];
                  }
                  return (
                    <Box key={key} m="4">
                      <NftCard
                        walletPublicKey={walletPublicKey}
                        pool={pool}
                        unstakeProof={unstakeProof}
                        trainerAccount={trainerAccount}
                        onClick={setSelectedTrainer}
                      />
                    </Box>
                  );
                })}
              </Center>
            </VStack>
          ) : (
            <VStack>
              <Text fontFamily="T1" color="white">
                No staked trainers found
              </Text>
            </VStack>
          ))}

        {selectedTab === PAGE_TABS.CLAIM && userAccount && pool && rewardToken && (
          <VStack w="96" spacing={8}>
            <Flex w="full" color="white" justifyContent="space-between">
              <Text textAlign={"left"} fontSize="18" fontWeight={600}>
                Trainers Staked
              </Text>
              <Text textAlign={"right"} fontSize="18" fontWeight={600}>
                {`${userAccount?.data.mintStakedCount.toString()}`}
              </Text>
            </Flex>
            <Flex w="full" color="white" justifyContent="space-between">
              <HStack>
                <Image
                  alt="token image"
                  w="8"
                  h="8"
                  borderRadius="20"
                  src={rewardToken.logoURI}
                />
                <Text textAlign={"left"} fontSize="18" fontWeight={600}>
                  {`${rewardToken.name} Claimed`}
                </Text>
              </HStack>
              <Text textAlign={"right"} fontSize="18" fontWeight={600}>
                {`${fromRawAmount(
                  9,
                  userAccount.data.rewardEarnedClaimed.toNumber()
                )}`}
              </Text>
            </Flex>
            <Flex w="full" color="white" justifyContent="space-between">
              <HStack>
                <Image
                  alt="token image"
                  w="8"
                  h="8"
                  borderRadius="20"
                  src={rewardToken.logoURI}
                />
                <Text textAlign={"left"} fontSize="18" fontWeight={600}>
                  {`${rewardToken.name} Available`}
                </Text>
              </HStack>
              <Text textAlign={"right"} fontSize="18" fontWeight={600}>
                {`${userAccount.getRewardsToClaim(
                  pool.data.rewardRatePerToken,
                  9
                )}`}
              </Text>
            </Flex>
            <Button
              size={"md"}
              border="1px solid grey"
              onClick={claimRewardClickHandler}
            >
              Claim
            </Button>
          </VStack>
        )}
      </VStack>
    </Box>
  );
};

export default ManagePoolPage;
