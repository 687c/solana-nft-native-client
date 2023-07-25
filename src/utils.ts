import { readFileSync } from "fs";
import { Keypair } from '@solana/web3.js';
import { homedir } from 'os';

const PROGRAM_KEYPAIR_PATH = homedir() + "/Documents/web3/solana/solana-nft-native/target/deploy/solana_nft_native-keypair.json"
const USER_KEYPAIR_PATH = homedir() + "/.config/solana/id.json"

export function userKeyPair(): Keypair {
    return Keypair.fromSecretKey(
        Buffer.from(JSON.parse(readFileSync(USER_KEYPAIR_PATH, "utf-8")))
    )
}

export function programKeyPair() {
    return Keypair.fromSecretKey(
        Buffer.from(JSON.parse(readFileSync(PROGRAM_KEYPAIR_PATH, "utf-8")))
    )
}
