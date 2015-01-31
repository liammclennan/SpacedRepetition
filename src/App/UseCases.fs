module UseCases
open Parser
open PostgresDoc.Doc
open SpacedRepetition

type UseCaseResult<'a> = 
    | Success of 'a
    | Error of string

let private store = SqlStore System.Configuration.ConfigurationManager.ConnectionStrings.["db"].ConnectionString

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
    |> Success

let private decksByUrl url (userId:System.Guid) =
    [
        "sourceUrl", box url
        "userId", box userId
    ]
    |> query<Deck> store "select [Data] from [deck] where Data.value('(/Deck/userId)[1]', 'uniqueidentifier') = @userId and Data.value('(/Deck/sourceUrl)[1]', 'nvarchar(512)') = @sourceUrl"
    
let viewDeckByUrl url (userId:System.Guid) =
    decksByUrl url userId
    |> (fun a -> Array.sub a 0 1)

let import url (userId:System.Guid) = 
    let trim (s:string) n =
        let shortened = s.[0..System.Math.Min(s.Length,n)]
        if shortened.Length < s.Length then
            shortened + "..."
        else
            s
    if decksByUrl url userId |> Array.isEmpty |> not then 
        ()
    else
        let repoDir = Git.fetch url
        let pathToFiles = FileSource.getMdFiles repoDir
        let deckId = System.Guid.NewGuid()
        let importedCards = // todo move this to SpacedRepetition
            pathToFiles
                |> Map.toList
                |> List.map (fun (path,content) -> content)
                |> List.map Parser.parse
                |> List.concat
                |> List.map (fun (q,a) -> { id = System.Guid.NewGuid(); front = q; back = a; created = System.DateTime.Now; deckId = deckId})
        let existingCards = 
            [("sourceUrl", box url); ("userId",box userId)]
            |> query<Card> store "select [card].[Data] from deck inner join card
            on deck.Id = card.[Data].value('(/Card/deckId)[1]', 'uniqueidentifier')
            where deck.[Data].value('(/Deck/sourceUrl)[1]', 'nvarchar(512)') = @sourceUrl
            and deck.[Data].value('(/Deck/userId)[1]', 'uniqueidentifier') = @userId"
        // todo build merged uow in SpacedRepetition, with nice tests
        let uow = (insert deckId {id = deckId; name = trim url 25; sourceUrl = url; userId = userId} :: (importedCards |> List.map (fun card -> insert card.id card)))
        commit store uow
        ()
