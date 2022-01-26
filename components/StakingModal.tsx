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
import { TrainerAccount } from "../hooks/useNftAccounts";
import { Pool } from "../models/pool";

const StakingModal = ({
  isOpen,
  pool,
  selectedTrainer,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  pool?: Pool;
  selectedTrainer?: TrainerAccount;
  onClose: () => void;
  onSubmit: () => void;
}) => {
  return (
    <Modal isOpen={isOpen} size="sm" onClose={onClose}>
      <ModalOverlay />
      <ModalContent backgroundColor={"white"}>
        <ModalHeader>
          <Center>Stake Trainer</Center>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {selectedTrainer && pool && (
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
              <Text>Unstaking period: 7 days</Text>
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
            >
              Submit
            </Button>
          </Center>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default StakingModal;
