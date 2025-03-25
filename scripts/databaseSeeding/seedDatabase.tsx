import {processChipsetData} from "@/scripts/databaseSeeding/chipsetProcessing";
import prisma from "@/app/lib/prisma";
import {AppDBChipSet} from "@/scripts/databaseSeeding/types";
import {S3Client, PutObjectCommand, ListObjectsV2Command, DeleteObjectsCommand} from "@aws-sdk/client-s3";
import * as fs from "node:fs";
import * as readline from "node:readline";
import path from "node:path";

const r2client = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: `${process.env.R2_ACCESS_KEY_ID}`,
        secretAccessKey: `${process.env.R2_SECRET_ACCESS_KEY}`
    },
});

async function seedDatabase() {
    const gameDatabase = "data/processed/RPG_RT_database.xml"
    const gameFilesPath = "data/2kki_game_files"
    const R2BucketNames = {
        chipsetImages: "chipsetImageFiles"
    }

    const reader = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    })

    const seedChipsetDataAnswer = await askQuestion(reader, "Seed Chipset Data? [y/n] ");
    switch (seedChipsetDataAnswer.toLowerCase()) {
        case "y":
            const chipsets = await processChipsetData(gameDatabase);
            await seedChipsetData(chipsets);
            break;
        case "n":
            break;
        default:
            console.log("Invalid input, defaulting to no");
            break;
    }

    const seedChipsetImagesAnswer = await askQuestion(reader, "Seed Chipset Data? [y/n] ");
    switch (seedChipsetImagesAnswer.toLowerCase()) {
        case "y":
            await wipeAllR2ObjectsFromPath(R2BucketNames.chipsetImages)
            await seedChipsetImages(`${gameFilesPath}/ChipSet`, R2BucketNames.chipsetImages)
            break;
        case "n":
            break;
        default:
            console.log("Invalid input, defaulting to no");
            break;
    }
}

function askQuestion(reader: readline.Interface, question: string): Promise<string> {
    return new Promise((resolve) => {
        reader.question(question, (answer) => {
            resolve(answer);
        });
    });
}


async function seedChipsetData(chipsets: Map<number, AppDBChipSet>) {
    console.log("Seeding Chipset Data...");

    for (const [id, chipset] of chipsets.entries()) {
        try {
            await prisma.chipset.create({
                data: {
                    chipsetId: String(id),
                    upperPassability: chipset.upperPassibility,
                    lowerPassability: chipset.lowerPassibility,
                    imageKey: chipset.imageKey
                },
            });

            console.log(`Uploaded chipset: ${chipset.imageKey}`);
        } catch (error) {
            console.error(`Failed to load chipset ${chipset}: ${error}`);
        }
    }

    console.log("Finished seeding Chipset Data");
}

async function seedChipsetImages(filepath: string, R2Path: string) {
    console.log("Seeding Chipset Images...");

    for (const filename of fs.readdirSync(filepath)) {
        const imageFile = fs.readFileSync(`${filepath}/${filename}`);
        const fileType = path.extname(filepath).toLowerCase() === "png" ? "image/png" : "image/bmp";

        await r2client.send(new PutObjectCommand({
            Bucket: `${process.env.R2_BUCKET}`,
            Key: `${R2Path}/${filename}`,
            Body: imageFile,
            ContentType: fileType,
        }));

        console.log(`Uploaded image: ${filename}`);
    }

    console.log("Finished seeding Chipset Images");
}

async function wipeAllR2ObjectsFromPath(R2Path: string) {
    console.log("Wiping Chipset Images...");

    const listCommand = new ListObjectsV2Command({
        Bucket: `${process.env.R2_BUCKET}`,
        Prefix: `${R2Path}/`,
    });

    let isTruncated = true;
    let continuationToken = undefined;

    while (isTruncated) {
        const listResponse = await r2client.send(listCommand)

        if (listResponse.Contents && listResponse.Contents.length > 0) {
            const objectsToDelete = listResponse.Contents.map(obj => ({ Key: obj.Key }));

            const deleteCommand = new DeleteObjectsCommand({
                Bucket: `${process.env.R2_BUCKET}`,
                Delete: {
                    Objects: objectsToDelete,
                    Quiet: false,
                }
            });

            const deleteResponse = await r2client.send(deleteCommand);
            console.log(`Deleted ${deleteResponse.Deleted?.length || 0} objects`);
        }

        isTruncated = listResponse.IsTruncated || false;
        continuationToken = listResponse.NextContinuationToken;

        if (isTruncated && continuationToken) {
            listCommand.input.ContinuationToken = continuationToken;
        }
    }

    console.log('Finished wiping chipset images');
}

seedDatabase().catch(e => {
    console.error('Error building database:', e);
    process.exit(1);
});