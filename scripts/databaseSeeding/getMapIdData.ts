export async function getMapData() {
    const mapIdPages = [
        "2kki/Map_IDs/0000-0400",
        "2kki/Map_IDs/0401-0800",
        "2kki/Map_IDs/0801-1200",
        "2kki/Map_IDs/1201-1600",
        "2kki/Map_IDs/1601-2000",
        "2kki/Map_IDs/2001-2400",
        "2kki/Map_IDs/2401-2800",
        "2kki/Map_IDs/2801-3200",
        "2kki/Map_IDs/3201-3600",
        "2kki/Map_IDs/3601-4000",
    ].join("|")

    const response = await fetch(`https://yume.wiki/api.php?action=query&format=json&titles=${mapIdPages}&prop=revisions&rvprop=content&rvslot=main`);
    const mapIdData = await response.json()
}