A terminal program that fetches a git repo, finds *.md files, and extracts a spaced repetition microformat, and writes the card data to a csv file.

The micro format
--------------

Wiki content.

Q>>> Do you like my hat? <<<
A>>> I do not! <<<

Wiki content.

Usage
----

    SpacedRepetition https://github.com/liammclennan/SpacedRepetition.git

The example above will find this markdown file, parse the spaced repetition microformat and  generate a csv file containing one row:

    "Do you like my hat?", "I do not!"
