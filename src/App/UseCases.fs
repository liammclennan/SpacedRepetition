module UseCases
open Parser
open PostgresDoc.Doc
open SpacedRepetition

type UseCaseResult<'a> = 
    | Success of 'a
    | Error of string

let private store = { connString = System.Configuration.ConfigurationManager.ConnectionStrings.["db"].ConnectionString }

let getUser (id:System.Guid) =
    ["id", box id]
    |> query<User> store "select data from user where id = :id"

let getOrCreateUser (email:string) =
    let users = ["email", box email]
                |> query<User> store @"select data from ""user"" where data->>'email' = :email;"
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
        |> query<Card> store "select data from card where data->>'deckId' = :deckId;"
    let studyLogs =
        ["deckId", box deckId]
        |> query<StudyLog> store "
select data from studylog
where CAST(data->>'cardId' as uuid) in (
	select id from card where data->>'deckId' = :deckId
)"
    SpacedRepetition.selectForStudy allCards studyLogs System.DateTime.Now
        |> Success    

let listDecks = 
    query<Deck> store "select data from deck;" []

let viewCardsByDeck id =
    ["deckId", box id]
    |> query<Card> store "select data from card where data->>'deckId' = :deckId;"
    |> Success

let viewDeckByUrl url =
    ["sourceUrl", box url]
    |> query<Deck> store "select data from deck where data->>'sourceUrl' = :sourceUrl;"
    |> (fun a -> Array.sub a 0 1)

let import url = 
    let repoDir = Git.fetch url
    let pathToFiles = FileSource.getMdFiles repoDir
    let deckId = System.Guid.NewGuid()
    let uow = (insert deckId {id = deckId; name = url; sourceUrl = url} :: (pathToFiles
                |> Map.toList
                |> List.map (fun (path,content) -> content)
                |> List.map Parser.parse
                |> List.concat
                |> List.map (fun (q,a) -> { id = System.Guid.NewGuid(); front = q; back = a; created = System.DateTime.Now; deckId = deckId})
                |> List.map (fun card -> insert card.id card))) 
    commit store uow
    ()
