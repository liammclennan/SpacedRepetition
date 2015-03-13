delete from [user]
where Data.value('(/User/email)[1]','nvarchar(256)') = ''

-- delete orphaned decks
delete from deck where Data.value('(/Deck/userId)[1]','uniqueidentifier') not in (
	select Id from [user]
)

delete from [card] where Data.value('(/Card/deckId)[1]','uniqueidentifier') not in (
	select Id from [deck]
)

delete from studylog where Data.value('(/StudyLog/cardId)[1]','uniqueidentifier') not in (
	select Id from [card]
)