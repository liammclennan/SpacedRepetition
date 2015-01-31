#r "../packages/SharpXml.1.5.0.0/lib/net40/SharpXml.dll"

open SharpXml

[<CLIMutable>]
type Card = { id:System.Guid; front: string; back: string; created: System.DateTime; deckId: System.Guid }
[<CLIMutable>]
type Deck = { id:System.Guid; name: string; sourceUrl: string; userId: System.Guid }
type CardResult = Easy | Hard
[<CLIMutable>]
type StudyLog = { id: System.Guid; ``when``: System.DateTime; result: CardResult; cardId: System.Guid }
[<CLIMutable>]
type User = {id: System.Guid; email: string}

let s = XmlSerializer.SerializeToString({id = System.Guid.NewGuid(); ``when`` = System.DateTime.Now; result = Hard; cardId = System.Guid.NewGuid()})

let o = XmlSerializer.DeserializeFromString<StudyLog>(s)

printfn "%+A" o



