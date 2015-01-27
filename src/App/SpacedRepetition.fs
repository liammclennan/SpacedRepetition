module SpacedRepetition

type Card = { id:System.Guid; front: string; back: string; created: System.DateTime; deckId: System.Guid }
type DueCard = {card: Card; sequence: int}
type Deck = { id:System.Guid; name: string; sourceUrl: string }
type CardResult = Easy | Hard
type StudyLog = { id: System.Guid; ``when``: System.DateTime; result: CardResult; cardId: System.Guid }
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