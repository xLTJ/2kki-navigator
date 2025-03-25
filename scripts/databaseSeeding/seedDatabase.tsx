import {processChipsetData} from "@/scripts/databaseSeeding/chipsetProcessing";
import prisma from "@/app/lib/prisma";

async function seedDatabase() {
    const gameDatabase = "data/processed/RPG_RT_database.xml"
    const chipsets = await processChipsetData(gameDatabase);

    for (const [id, chipset] of chipsets.entries()) {
        try {
            if (id === 2456) {
                console.log(`Seeding ${id} chipset: ${chipset}`);
            }
            await prisma.chipset.create({
                data: {
                    chipsetId: String(id),
                    upperPassability: chipset.upperPassibility,
                    lowerPassability: chipset.lowerPassibility,
                    imageKey: chipset.imageKey
                },
            });
        } catch (error) {
            console.error(`Failed to load chipset ${chipset}: ${error}`);
        }
    }
}

seedDatabase().catch(e => {
    console.error('Error building database:', e);
    process.exit(1);
});