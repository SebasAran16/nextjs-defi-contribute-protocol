import { useMoralis, useWeb3Contract } from "react-moralis";
import { useNotification } from "@web3uikit/core";
import { ENSAvatar, Card, Button } from "web3uikit";
import abiDoc from "../../constants/defiContributeAbi.json";
import contractDoc from "../../constants/DefiContributeAddress.json";
import styles from "/styles/components/DoneeRequestsBox.module.css";

export const DoneeRequestBox = ({ donee, message, index }) => {
  const abi = abiDoc.abi;
  const contractAddress = contractDoc.gor.contractAddress;

  const dispatch = useNotification();
  const { enableWeb3 } = useMoralis();

  const { runContractFunction: rejectDonee } = useWeb3Contract({
    contractAddress,
    abi,
    functionName: "rejectDonee",
    params: { _donee: donee },
  });

  const { runContractFunction: approveDonee } = useWeb3Contract({
    contractAddress,
    abi,
    functionName: "approveDonee",
    params: { _donee: donee },
  });

  return (
    <div className={styles.cardContainer}>
      <Card
        style={{
          backgroundColor: "gray",
          display: "flex",
          flexDirection: "column",
          padding: "1.2rem",
          color: "yellow",
        }}
        cursorType={"default"}
      >
        <div>
          <div className={styles.avatarId}>
            <ENSAvatar address={donee} size={50} />
            <p>#{index} Donee Request</p>
          </div>
          <p>{`Address: ${donee.slice(0, 8)}...${donee.slice(-6)}`}</p>
          <p>{`Message: ${message}`}</p>
        </div>
        <div className={styles.buttonsContainer}>
          <Button
            text="Reject"
            theme="colored"
            color="red"
            onClick={async () => {
              await enableWeb3();
              await rejectDonee({
                onError: (error) => {
                  dispatch({
                    type: "error",
                    title: "Not rejected",
                    message:
                      "It seems we had an issue and you could not reject the candidate.",
                    position: "topR",
                  });
                  console.log(error);
                },
                onSuccess: () => {
                  dispatch({
                    type: "success",
                    title: "Donee Rejected",
                    message: `You have rejected the request from ${donee.slice(
                      0,
                      6
                    )}...${donee.slice(-4)}`,
                    position: "topR",
                  });
                },
              });
            }}
          />
          <Button
            text="Accept"
            theme="colored"
            color="green"
            onClick={async () => {
              await enableWeb3();
              await approveDonee({
                onError: (error) => {
                  dispatch({
                    type: "error",
                    title: "Did not approved...",
                    message: `It seemed we had an error and you could not approve the donee.`,
                    position: "topR",
                  });
                  console.log(error);
                },
                onSuccess: () => {
                  dispatch({
                    type: "success",
                    title: "Donee Approved",
                    message: `The address ${donee.slice(0, 6)}...${donee.slice(
                      -4
                    )} is now a Donee!`,
                    position: "topR",
                  });
                },
              });
            }}
          />
        </div>
      </Card>
    </div>
  );
};
