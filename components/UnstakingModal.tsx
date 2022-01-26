import {
  Image,
  Text,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Center,
  VStack,
} from "@chakra-ui/react";
import { PublicKey } from "@solana/web3.js";
import { useCallback } from "react";
import { TrainerAccount, TrainerStakeStatus } from "../hooks/useNftAccounts";
import { Pool } from "../models/pool";
import { UnstakeProof } from "../models/unstakeProof";

const UnstakingModal = ({
  isOpen,
  walletPublicKey,
  pool,
  unstakeProof,
  selectedTrainer,
  onClose,
  beginUnstake,
  unstake,
}: {
  isOpen: boolean;
  walletPublicKey?: PublicKey;
  pool?: Pool;
  unstakeProof?: UnstakeProof;
  selectedTrainer?: TrainerAccount;
  onClose: () => void;
  beginUnstake: () => void;
  unstake: () => void;
}) => {
  const onSubmit = useCallback(() => {
    if (!walletPublicKey || !pool || !beginUnstake || !unstake) {
      return;
    }
    const stakeStatus = selectedTrainer?.getStakeStatus(
      walletPublicKey,
      pool.data.unstakeDuration,
      unstakeProof?.data.unstakeTimestamp
    );
    if (stakeStatus === TrainerStakeStatus.STAKED) {
      return beginUnstake();
    } else {
      return unstake();
    }
  }, [walletPublicKey, pool, unstakeProof, beginUnstake, unstake]);

  return (
    <Modal isOpen={isOpen} size="sm" onClose={onClose}>
      <ModalOverlay />
      <ModalContent backgroundColor={"gray.100"}>
        <ModalHeader>
          <Center>Unstake Trainer</Center>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {selectedTrainer && (
            <VStack m="4">
              <Image
                alt="selected nft"
                w="48"
                objectFit="cover"
                boxShadow="md"
                borderRadius="lg"
                src={selectedTrainer.staticData.image}
              />
              <Text fontWeight={"bold"}>{selectedTrainer.staticData.name}</Text>
            </VStack>
          )}
        </ModalBody>
        <ModalFooter>
          <Center w="full">
            <Button
              bgColor="green"
              color="black"
              mr={3}
              _hover={{
                bgColor: "light-green",
              }}
              onClick={onSubmit}
              disabled={!onSubmit}
            >
              Submit
            </Button>
          </Center>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UnstakingModal;
