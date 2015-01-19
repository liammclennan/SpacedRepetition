module UseCases
open Parser
open PostgresDoc.Doc

type Card = { id:System.Guid; front: string; back: string; due: System.DateTime; imported: System.DateTime; deckId: System.Guid}
type Deck = { id:System.Guid; name: string; sourceUrl: string }

let private store = { connString = System.Configuration.ConfigurationManager.ConnectionStrings.["db"].ConnectionString }
    
let viewDeck url =
    ["sourceUrl", box url]
    |> query<Deck> store "select data from deck where data->>'sourceUrl' = :sourceUrl;"

let import url = 
    let repoDir = Git.fetch url
    let pathToFiles = FileSource.getMdFiles repoDir
    let deckId = System.Guid.NewGuid()
    let uow = (insert deckId {id = deckId; name = url; sourceUrl = url} :: (pathToFiles
                |> Map.toList
                |> List.map (fun (path,content) -> content)
                |> List.map Parser.parse
                |> List.concat
                |> List.map (fun (q,a) -> { id = System.Guid.NewGuid(); front = q; back = a; due = System.DateTime.Now; imported = System.DateTime.Now; deckId = deckId})
                |> List.map (fun card -> insert card.id card))) 
    commit store uow
    ()
