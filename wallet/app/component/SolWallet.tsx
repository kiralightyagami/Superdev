import { useState } from "react"
import { mnemonicToSeed } from "bip39";
import { derivePath } from "ed25519-hd-key";
import { Keypair } from "@solana/web3.js";
import nacl from "tweetnacl"
import { generateMnemonic } from "bip39";

interface SolanaWalletProps {
  mnemonic: string;
}
const mnemonic = generateMnemonic()
export function SolanaWallet({ mnemonic }: SolanaWalletProps) {
   const [currentIndex,SetCurrentIndex] = useState(0);
   const [publicKeys, SetPublicKeys] = useState<Keypair['publicKey'][]>([]);

    async function createWallet(){
        const seed = await mnemonicToSeed(mnemonic);
        const path = `m/44'/501'${currentIndex}'/0'`;
        const derivedSeed = derivePath(path, seed.toString('hex')).key;
        const secret = nacl.sign.keyPair.fromSeed(derivedSeed).secretKey;
        const keypair = Keypair.fromSecretKey(secret);
        SetCurrentIndex(currentIndex+1);
        SetPublicKeys([...publicKeys, keypair.publicKey])
    }    
   

    return <div>
        <button onClick={createWallet}>
                Add Sol Wallet
        </button>
        {publicKeys.map(p => <div>
            {p.toBase58()}
        </div>)

        }
    </div>

}