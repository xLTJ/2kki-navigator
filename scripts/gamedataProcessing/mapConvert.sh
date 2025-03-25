for file in ../../data/2kki_game_files/maps/Map*.lmu; do
  printf "Processing %s\n" "$file"
  ./lcf2xml.exe "$file"

  prefix="../../data/2kki_game_files/maps/"
  suffix=".lmu"
  mapName="${file#"$prefix"}"
  mapName="${mapName%"$suffix"}"
  mv "${mapName}.emu" "../../data/processed/maps/${mapName}.xml"
done