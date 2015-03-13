module SpacedRepetition
open SequentialGuid
open PostgresDoc

[<CLIMutable>]
type Card = { id:System.Guid; front: string; back: string; created: System.DateTime; deckId: System.Guid }
[<CLIMutable>]
type Deck = { id:System.Guid; name: string; sourceUrl: string; userId: System.Guid }
type CardResult = Easy | Hard
[<CLIMutable>]
type StudyLog = { id: System.Guid; ``when``: System.DateTime; result: CardResult; cardId: System.Guid }
[<CLIMutable>]
type User = {id: System.Guid; email: string}

// EF' = EF+(0.1-(5-q)*(0.08+(5-q)*0.02))
let eFModifier ef result =
    let q = match result with
            | Easy -> 4.
            | Hard -> 1.
    ef + (0.1-(5.-q)*(0.08+(5.-q)*0.02))    

// n is number of repetitions
// ef is 'easiness factor'. 1.3 is most difficult. 2.5 is easiest. 
// http://www.supermemo.com/english/ol/sm2.htm
let rec sm2 n ef = 
    if n = 1 then 1.
    elif n = 2 then 6.
    else
        sm2 (n-1) ef * ef

let isDue (card:Card) (logs:StudyLog seq) now =
    let logsOrdered = Seq.filter (fun l -> l.cardId = card.id) logs
                        |> Seq.sortBy (fun sl -> sl.``when``) 
                        |> List.ofSeq                        
    if List.isEmpty logsOrdered then true
    else
        let ef' = List.fold (fun state item -> eFModifier state item.result) 2.5 logsOrdered
        let gap = sm2 (List.length logsOrdered) ef'
        let mostRecentLog = logsOrdered.Item (List.length logsOrdered - 1)
        let due = mostRecentLog.``when``.AddDays(gap) 
        due < now
    
let selectForStudy (allCards:Card array) (studyLogs:StudyLog array) now = 
    let items = Array.filter (fun c -> isDue c studyLogs now) allCards
    items

let processMarkdown (cards:Card seq) = 
    let markdowner = new MarkdownSharp.Markdown()
    Seq.map (fun card -> 
        { card with front = markdowner.Transform(card.front); back = markdowner.Transform(card.back)})
        cards

// Returns (q,a) pairs
let extractSpacedRepetitionData (pathToFiles:Map<string,string> (*this is a map of path to file contents*)) =
    pathToFiles
        |> Map.toList
        |> List.map (fun (path,content) -> content)
        |> List.map Parser.parse
        |> List.concat 

let cardFromDataWithId deckId cardId ((q,a):string * string) = 
    { id = cardId; front = q; back = a; created = System.DateTime.Now; deckId = deckId}

let cardFromDataWithNewId deckId ((q,a):string * string) = 
    { id = SequentialGuid.Create(SequentialGuidType.SequentialAtEnd); front = q; back = a; created = System.DateTime.Now; deckId = deckId}

let syncCards (existingCards:Card[]) (srData:(string * string) list(*[(q,a)]*)) deckId = 
    // this function is required because the db roundtrip seems to convert
    // \n -> \r\n meaning that the text no longer matches.
    let textMatch (f:string) (s:string) = 
        f.Replace("\r\n", "\n") = s.Replace("\r\n","\n")

    let createCard = fun (q,a) -> 
        match Array.filter (fun card -> textMatch card.front q) existingCards with
            | [||] -> 
                let id = SequentialGuid.Create(SequentialGuidType.SequentialAtEnd)
                Some <| insert id (cardFromDataWithId deckId id (q,a))
            | matches -> let existingCard = matches.[0]
                         if textMatch existingCard.back a then 
                            None
                         else
                            Some <| update existingCard.id {existingCard with back = a}
    
    let deletes = 
        existingCards |> Array.filter (fun c -> List.exists (fun (q,a) -> textMatch c.front q) srData |> not)
        |> Array.map (fun c -> delete c.id c) 
        |> List.ofArray
    let updatesAndInserts = List.choose createCard srData
    deletes @ updatesAndInserts

    