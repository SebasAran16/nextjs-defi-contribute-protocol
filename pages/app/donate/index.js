import { DonateLayout } from "../../../src/layouts/donate-layout";
import styles from "/styles/Donate.module.css";
import { useQuery, gql } from "@apollo/client";
import { useMoralis } from "react-moralis";
import { DoneeBox } from "../../../src/components/DoneeBox";

const GET_ACTIVE_DONEES = gql`
  {
    activeDonees(
      where: { donee_not: "0x000000000000000000000000000000000000dEaD" }
    ) {
      id
      doneeId
      donee
      cause
      message
    }
  }
`;

export default function Donate() {
  const { loading, error, data: donees } = useQuery(GET_ACTIVE_DONEES);

  const { isWeb3Enabled, account } = useMoralis();

  return (
    <div className={styles.mainContainer}>
      <h1>Donate</h1>
      <h2>You can donate to the following causes:</h2>
      <section className={styles.doneesContainer}>
        {!error && !loading && donees.activeDonees.length > 0 ? (
          donees.activeDonees.map((donee) => {
            return (
              <DoneeBox
                key={donee.doneeId}
                cause={donee.cause}
                doneeId={donee.doneeId}
                message={donee.message}
                address={donee.donee}
              />
            );
          })
        ) : loading ? (
          <p className={styles.noDoneeResponses}>Loading...</p>
        ) : error ? (
          <p
            className={styles.noDoneeResponses}
          >{`Could not load due to the followig error: ${error}`}</p>
        ) : donees.activeDonees.length == 0 ? (
          <p className={styles.noDoneeResponses}>No donees yet</p>
        ) : (
          ""
        )}
      </section>
    </div>
  );
}

Donate.getLayout = function getLayout(page) {
  return <DonateLayout>{page}</DonateLayout>;
};

// export async function getStaticProps(context) {
//   return {
//     props: { loading, error, donees },
//   };
// }

// export async function getStaticPaths() {}
