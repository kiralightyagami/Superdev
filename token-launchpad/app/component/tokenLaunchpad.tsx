import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { MINT_SIZE, TOKEN_2022_PROGRAM_ID, createMintToInstruction, createAssociatedTokenAccountInstruction, getMintLen, createInitializeMetadataPointerInstruction, createInitializeMintInstruction, TYPE_SIZE, LENGTH_SIZE, ExtensionType, mintTo, getOrCreateAssociatedTokenAccount, getAssociatedTokenAddressSync } from "@solana/spl-token"
import { createInitializeInstruction, pack } from '@solana/spl-token-metadata';


export function launchpad() {
    const connection = useConnection();
    const wallet = useWallet()

    async function createToken(){
        const mintKeypair = Keypair.generate();
        const metadata = {
            mint:mintKeypair.publicKey,
            name:"Kira",
            symbol:"god",
            uri:"https:xyz.com",
            additionalMetadata:[]
        }

        const minLen = getMintLen([ExtensionType.MetadataPointer]);
        const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;

        const lamports = await connection.getMinimumBalanceForRentExemption(minLen, metadataLen);

        const transaction = new Transaction().add(
            SystemProgram.createAccount({
                fromPubkey: wallet.publicKey,
                newAccountPubkey: mintKeypair.publicKey,
                space: minLen,
                lamports,
                programId: TOKEN_2022_PROGRAM_ID
            }),
            createInitializeMetadataPointerInstruction(mintKeypair.publicKey,wallet.publicKey, mintKeypair.publicKey,TOKEN_2022_PROGRAM_ID),
            createInitializeMintInstruction(mintKeypair.publicKey, 9 , wallet.publicKey, null , TOKEN_2022_PROGRAM_ID),
            createInitializeInstruction({
                programId: TOKEN_2022_PROGRAM_ID,
                mint: mintKeypair.publicKey,
                metadata: mintKeypair.publicKey,
                name: metadata.name,
                symbol: metadata.symbol,
                uri: metadata.uri,
                mintAuthority: wallet.publicKey,
                updateAuthority: wallet.publicKey,
            }),
        );

        transaction.feePayer = wallet.publicKey;
        transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
        transaction.partialSign(mintKeypair);

        await wallet.sendTransaction(transaction, connection);

        const associateToken = getAssociatedTokenAddressSync(
            mintKeypair.publicKey,
            wallet.publicKey,
            false,
            TOKEN_2022_PROGRAM_ID
        );

        const transaction2 = new Transaction().add(
            createAssociatedTokenAccountInstruction(
                wallet.publicKey,
                associateToken,
                wallet.publicKey,
                mintKeypair.publicKey,
                TOKEN_2022_PROGRAM_ID
            ),
        );

        await wallet.sendTransaction(transaction2, connection);

        const transaction3 = new Transaction().add(
            createMintToInstruction(
                mintKeypair.publicKey,
                associateToken,
                wallet.publicKey,
                1000000000,
                [],
                TOKEN_2022_PROGRAM_ID
            )
        );

        await wallet.sendTransaction(transaction3, connection);

        console.log("Minted");
    }
}