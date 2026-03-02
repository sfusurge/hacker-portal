input_file = "major.csv"
output_file = "output.csv"

seen = set()

with open(input_file, "r", encoding="utf-8") as infile, \
     open(output_file, "w", encoding="utf-8") as outfile:

    for line in infile:
        clean = line.strip()

        # Skip if it's already seen
        if clean in seen:
            continue

        seen.add(clean)
        outfile.write(clean + "\n")
