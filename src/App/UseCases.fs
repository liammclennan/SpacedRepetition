module UseCases
open Parser
open PostgresDoc.Doc
open SpacedRepetition

type UseCaseResult<'a> = 
    | Success of 'a
    | Error of string

let private store = SqlStore System.Configuration.ConfigurationManager.ConnectionStrings.["studynotesapi_db"].ConnectionString    

let getUser (id:System.Guid) =
    ["id", box id]
    |> query<User> store "select [Data] from [user] where id = @id"

let getOrCreateUser (email:string) =
    let users = ["email", box email]
                |> query<User> store @"select [Data] from [user] where
                Data.value('(/User/email)[1]', 'nvarchar(256)') = @email"
    match users with
        | [||] -> 
            let user = {id = System.Guid.NewGuid(); email = email}
            commit store [insert user.id user]
            user
        | [|user|] -> user
        | _ -> failwith "There are > 1 users with the same email address"

let persistResult cardId (result:CardResult) =
    let logId = System.Guid.NewGuid()
    [insert logId {id = logId; ``when`` = System.DateTime.Now; result = result; cardId = cardId}]
    |> commit store    

let cardsForStudy deckId =
    let allCards = 
        ["deckId", box deckId]
        |> query<Card> store "select [Data] from [card] where Data.value('(/Card/deckId)[1]', 'uniqueidentifier') = @deckId;"
    let studyLogs =
        ["deckId", box deckId]
        |> query<StudyLog> store "
select [Data] from [studylog]
where Data.value('(/StudyLog/cardId)[1]', 'uniqueidentifier') in (
	select Id from [card] where Data.value('(/Card/deckId)[1]', 'uniqueidentifier') = @deckId
)"
    SpacedRepetition.selectForStudy allCards studyLogs System.DateTime.Now
        |> Success    

let listDecks (userId:System.Guid) = 
    ["userId", box userId]
    |> query<Deck> store "select [Data] from deck where Data.value('(/Deck/userId)[1]', 'uniqueidentifier') = @userId"

let viewCardsByDeck id =
    ["deckId", box id]
    |> query<Card> store "select [Data] from [card] where Data.value('(/Card/deckId)[1]', 'uniqueidentifier') = @deckId"

let private decksByUrl url (userId:System.Guid) =
    [
        "sourceUrl", box url
        "userId", box userId
    ]
    |> query<Deck> store "select [Data] from [deck] where Data.value('(/Deck/userId)[1]', 'uniqueidentifier') = @userId and Data.value('(/Deck/sourceUrl)[1]', 'nvarchar(512)') = @sourceUrl"
    
let viewDeckByUrl url (userId:System.Guid) =
    decksByUrl url userId
    |> (fun a -> Array.sub a 0 1)

let private getSpacedRepetitionDataFromUrl url = 
    let repoDir = Git.fetch url
    let pathToFiles = FileSource.getMdFiles repoDir
    SpacedRepetition.extractSpacedRepetitionData pathToFiles 
    
let sync (deckId:System.Guid) =
    let deck = ["id", box deckId]
                |> query<Deck> store "select [Data] from [deck] where Id = @id"
                |> (fun decks -> if Array.isEmpty decks then failwith ("Could not find deck " + string deckId) else decks.[0])
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
                            |> List.map (SpacedRepetition.cardFromData deckId)
        let uow = (insert deckId {id = deckId; name = trim url 25; sourceUrl = url; userId = userId} :: (importedCards |> List.map (fun card -> insert card.id card)))
        commit store uow
        ()
