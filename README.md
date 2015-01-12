A terminal program that fetches a git repo, finds *.md files, and extracts a spaced repetition microformat, and writes the card data to a csv file.

The idea is 

> to create study wikis, and embed spaced repetion cards in the content. This tool then extracts the card content and exports to csv for import into spaced repetition tools like Anki.

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

About spaced repetition
--------

From wikipedia:

> Spaced repetition is a learning technique that incorporates increasing intervals of time between subsequent review of previously learned material in order to exploit the psychological spacing effect. 

<img src="http://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Leitner_system_alternative.svg/460px-Leitner_system_alternative.svg.png" alt="spaced repetition"/>

