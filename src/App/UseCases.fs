module UseCases
open Parser
open PostgresDoc
open SpacedRepetition

type UseCaseResult<'a> = 
    | Success of 'a
    | Error of string

let private store = SqlStore System.Configuration.ConfigurationManager.ConnectionStrings.["studynotesapi_db"].ConnectionString    

let getUser (id:System.Guid) =
    ["id", box id]
    |> select<User> store "select [Data] from [user] where id = @id"

let getOrCreateUser (email:string) =
    let users = ["email", box email]
                |> select<User> store @"select [Data] from [user] where
                Data.value('(/User/email)[1]', 'nvarchar(256)') = @email"
    match users with
        | [||] -> 
            let user = {id = System.Guid.NewGuid(); email = email}
            commit store [insert user.id user]
            user
        | [|user|] -> user
        | _ -> failwith "There are > 1 users with the same email address"

let changeDeckName (deckId:System.Guid) (name:string) = 
    let decks = ["deckId", box deckId] 
               |> select<Deck> store @"select [Data] from [deck] where id = @deckId"
    if Array.length decks <> 1 then
        Error "Unable to find deck to update"
    else
        let deck = decks.[0]
        commit store [update deck.id {deck with name = name}]
        Success ()

let persistResult cardId (result:CardResult) =
    let logId = System.Guid.NewGuid()
    [insert logId {id = logId; ``when`` = System.DateTime.Now; result = result; cardId = cardId}]
    |> commit store    

let cardsForStudy userId deckId =
    let allCards = 
        [("deckId", box deckId);("userId", box userId)]
        |> select<Card> store "
select c.[Data] from [card] c
inner join deck d on c.Data.value('(/Card/deckId)[1]', 'uniqueidentifier') = d.Id
and d.Id = @deckId
and d.Data.value('(/Deck/userId)[1]', 'uniqueidentifier') = @userId
"
    let studyLogs =
        ["deckId", box deckId]
        |> select<StudyLog> store "
select [Data] from [studylog]
where Data.value('(/StudyLog/cardId)[1]', 'uniqueidentifier') in (
	select Id from [card] where Data.value('(/Card/deckId)[1]', 'uniqueidentifier') = @deckId
)"
    SpacedRepetition.selectForStudy allCards studyLogs System.DateTime.Now
        |> Success    

let listDecks (userId:System.Guid) = 
    let decksWithCardsDue (userId:System.Guid) =
        let logs = ["userId", box userId] 
                   |> select<StudyLog> store "
    select sl.Data from deck d
    inner join [card] c on c.Data.value('(/Card/deckId)[1]','uniqueidentifier') = d.Id
    inner join [studylog] sl on sl.Data.value('(/StudyLog/cardId)[1]','uniqueidentifier') = c.Id
    where d.Data.value('(/Deck/userId)[1]', 'uniqueidentifier') = @userId"
        let cardsByDeckId = [("userId", box userId)]
                            |> select<Card> store "
    select c.[Data] from [card] c
    inner join deck d on c.Data.value('(/Card/deckId)[1]', 'uniqueidentifier') = d.Id
    and d.Data.value('(/Deck/userId)[1]', 'uniqueidentifier') = @userId
    "                       |> Seq.groupBy (fun card -> card.deckId) |> dict
        Seq.map 
            (fun deckId -> 
                deckId, Array.length (SpacedRepetition.selectForStudy (Array.ofSeq cardsByDeckId.[deckId]) logs System.DateTime.Now)) 
                cardsByDeckId.Keys
                |> Map.ofSeq

    let dueCounts = decksWithCardsDue userId
    ["userId", box userId]
    |> select<Deck> store "select [Data] from deck where Data.value('(/Deck/userId)[1]', 'uniqueidentifier') = @userId"
    |> Array.map (fun deck -> deck, if dueCounts.ContainsKey(deck.id) then dueCounts.[deck.id] else 0) 


let private decksByUrl url (userId:System.Guid) =
    [
        "sourceUrl", box url
        "userId", box userId
    ]
    |> select<Deck> store "select [Data] from [deck] where Data.value('(/Deck/userId)[1]', 'uniqueidentifier') = @userId and Data.value('(/Deck/sourceUrl)[1]', 'nvarchar(512)') = @sourceUrl"
    
let viewDeckByUrl url (userId:System.Guid) =
    decksByUrl url userId
    |> (fun a -> Array.sub a 0 1)

let private getSpacedRepetitionDataFromUrl url = 
    let repoDir = Git.fetch url
    let pathToFiles = FileSource.getMdFiles repoDir
    SpacedRepetition.extractSpacedRepetitionData pathToFiles 
    
let sync (deckId:System.Guid) (userId:System.Guid) =
    let viewCardsByDeck id =
        ["deckId", box id]
        |> select<Card> store "select [Data] from [card] where Data.value('(/Card/deckId)[1]', 'uniqueidentifier') = @deckId"

    let deck = ["id", box deckId]
                |> select<Deck> store "select [Data] from [deck] where Id = @id"
                |> (fun decks -> if Array.isEmpty decks then failwith ("Could not find deck " + string deckId) else decks.[0])
    if deck.userId <> userId then
        failwith "Unable to sync someone else's deck"
    let srData = getSpacedRepetitionDataFromUrl deck.sourceUrl
    let existingCards = viewCardsByDeck deckId
    SpacedRepetition.syncCards existingCards srData deckId
        |> commit store
    Success ()

let import url (userId:System.Guid) = 
    let trim (s:string) n =
        let shortened = s.[0..System.Math.Min(s.Length,n)]
        if shortened.Length < s.Length then
            shortened + "..."
        else
            s
    let deckExists = decksByUrl url userId |> Array.isEmpty |> not
    if deckExists then 
        ()
    else
        let deckId = System.Guid.NewGuid()
        let importedCards = getSpacedRepetitionDataFromUrl url
                            |> List.map (SpacedRepetition.cardFromDataWithNewId deckId)
        let uow = (insert deckId {id = deckId; name = trim url 25; sourceUrl = url; userId = userId} :: (importedCards |> List.map (fun card -> insert card.id card)))
        commit store uow
        ()

let init ()=
    createTable store "card"
    createTable store "deck"
    createTable store "studylog"
    createTable store "user"
    ()
