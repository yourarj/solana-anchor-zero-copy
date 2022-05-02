import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { findProgramAddressSync } from "@project-serum/anchor/dist/cjs/utils/pubkey";
import { SolanaAnchorZeroCopy } from "../target/types/solana_anchor_zero_copy";

describe("solana-anchor-zero-copy", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace
    .SolanaAnchorZeroCopy as Program<SolanaAnchorZeroCopy>;

  const author = anchor.web3.Keypair.generate();
  console.log(new Date(), "User pubkey is", author.publicKey.toBase58());
  const connection = anchor.getProvider().connection;

  let [pda, bump] = findProgramAddressSync(
    [
      anchor.utils.bytes.utf8.encode("data_holder_v0"),
      author.publicKey.toBuffer(),
    ],
    program.programId
  );

  // mocha before script
  before(async () => {
    console.log(new Date(), "requesting airdrop");
    const airdropTx = await connection.requestAirdrop(
      author.publicKey,
      5 * anchor.web3.LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(airdropTx);
  });

  it("Is initialized!", async () => {
    const tx = await program.methods
      .initialize()
      .accounts({
        author: author.publicKey,
        dataHolder: pda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([author])
      .rpc();
    console.log("Your transaction signature", tx);
  });

  it("Able to set text!", async () => {
    const tx = await program.methods
      .setData("nice")
      .accounts({
        writer: author.publicKey,
        dataHolder: pda,
      })
      .signers([author])
      .rpc();
    console.log("Your transaction signature", tx);
  });

  // send max allowed length string
  it("Send 920 long character", async () => {
    const string_length = 920;
    const tx = await program.methods
      .setData("A".repeat(string_length))
      .accounts({
        writer: author.publicKey,
        dataHolder: pda,
      })
      .signers([author])
      .rpc();
    console.log(string_length, "Your transaction signature", tx);
  });

  // send messages until it overflows
  it("Send 920 long character 8 times to make account big", async () => {
    for (let counter = 1; counter < 14; counter++) {
      const string_length = 920;
      try {
        const tx = await program.methods
          .setData("A".repeat(string_length))
          .accounts({
            writer: author.publicKey,
            dataHolder: pda,
          })
          .signers([author])
          .rpc();
        console.log("#", counter, "Your transaction signature", tx);
        console.log(
          "https://explorer.solana.com/tx/" +
            tx +
            "?cluster=custom&customUrl=http%3A%2F%2Flocalhost%3A8899"
        );
      } catch (e) {
        console.log("error occurred: ", e);
        console.log("solana validator will stop after 30 seconds");

        await new Promise((resolve) => setTimeout(resolve, 30_000));
      }
    }
  });
});
