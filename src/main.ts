import {
    clusterApiUrl,
    ComputeBudgetProgram,
    Connection,
    Keypair,
    PublicKey,
    sendAndConfirmTransaction,
    SystemProgram,
    SYSVAR_RENT_PUBKEY,
    Transaction,
    TransactionInstruction,
} from "@solana/web3.js";
import { userKeyPair, programKeyPair } from "./utils";
import { PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID, transferArgsBeet } from "@metaplex-foundation/mpl-token-metadata";

import * as borsh from "borsh";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

class TokenArgs {
    nft_title: string;
    nft_symbol: string;
    nft_uri: string;

    constructor(nft_title: string, nft_symbol: string, nft_uri: string) {
        this.nft_title = nft_title;
        this.nft_symbol = nft_symbol;
        this.nft_uri = nft_uri;
    }

    serialize(): Buffer {
        const schema = new Map([
            [
                TokenArgs,
                {
                    kind: "struct",
                    fields: [
                        ["nft_title", "string"],
                        ["nft_symbol", "string"],
                        ["nft_uri", "string"],
                    ],
                },
            ],
        ]);
        return Buffer.from(borsh.serialize(schema, this));
    }
}

async function createToken(): Promise<String> {
    let connection = new Connection(clusterApiUrl("devnet"));
    let programId = programKeyPair().publicKey;
    const payer = userKeyPair();

    const mintKeypair: Keypair = Keypair.generate();

    const metadataAddress = PublicKey.findProgramAddressSync(
        [
            Buffer.from("metadata"),
            TOKEN_METADATA_PROGRAM_ID.toBuffer(),
            mintKeypair.publicKey.toBuffer(),
        ],
        TOKEN_METADATA_PROGRAM_ID
    )[0];

    const instructionData = new TokenArgs("Kobeni", "KBN", "https://raw.githubusercontent.com/687c/solana-nft-native-client/main/metadata.json");

    let ix = new TransactionInstruction({
        keys: [
            { pubkey: mintKeypair.publicKey, isSigner: true, isWritable: true },            // Mint account
            { pubkey: payer.publicKey, isSigner: false, isWritable: true },                 // Mint authority account
            { pubkey: metadataAddress, isSigner: false, isWritable: true },                 // Metadata account
            { pubkey: payer.publicKey, isSigner: true, isWritable: true },                  // Payer
            { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },             // Rent account
            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },        // System program
            { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },               // Token program
            { pubkey: TOKEN_METADATA_PROGRAM_ID, isSigner: false, isWritable: false },      // Token metadata program
        ],
        data: instructionData.serialize(),
        programId: programId,
    });

    const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
        units: 1000000
    });

    const tx = new Transaction()
        .add(modifyComputeUnits)
        .add(ix);

    return await sendAndConfirmTransaction(connection, tx, [payer, mintKeypair]);
}

createToken()
    .then(txSig => console.log(`tx hash: https://solscan.io/tx/${txSig}?cluster=devnet`))
    .catch((err) => console.error("program execution unsuccessful", err))

// async function helloWorld(): Promise<String> {
//     const ix = new TransactionInstruction({
//         keys: [],
//         programId
//     });

//     const tx = new Transaction().add(ix);

//     return await sendAndConfirmTransaction(connection, tx, [payer]);
// }

// helloWorld()
//     .then((txSig) => console.log("tx sig: ", txSig))
//     .catch((err) => console.error("program execution unsuccessful", err))
