module SpacedRepetition

type Card = { id:System.Guid; front: string; back: string; created: System.DateTime; deckId: System.Guid }
type DueCard = {card: Card; sequence: int}
type Deck = { id:System.Guid; name: string; sourceUrl: string }
type StudyLog = { id: System.Guid; ``when``: System.DateTime; correct: bool; cardId: System.Guid }

let selectForStudy allCards studyLogs now = 
    // todo: this is where spaced repetition algorithms go
    allCards
    