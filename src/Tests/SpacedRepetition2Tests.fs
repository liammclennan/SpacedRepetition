module Tests

open NUnit.Framework
open SpacedRepetition
open FsCheck
open FsUnit

let newCardsAreAlwaysDue card = isDue card Seq.empty System.DateTime.Now = true

let studiedNAgo n ago result = 
    let card = {id = System.Guid.NewGuid(); front = ""; back = ""; created = System.DateTime.Now.AddDays(-1000.); deckId = System.Guid.NewGuid()}
    (card, seq { for i in [1..n] -> {id = System.Guid.NewGuid(); ``when`` = System.DateTime.Now.AddDays(ago * -1.); result = result; cardId = card.id}})

[<TestFixture>]
type ``given an easy card studied 3 times 20 days ago``() =
    let (card,logs) = studiedNAgo 3 20. Easy

    [<Test>]
    member this.``it should be due``() =
        isDue card logs (System.DateTime.Now) |> should be True

[<TestFixture>]
type ``given an easy card studied 3 times 10 days ago``() =
    let (card,logs) = studiedNAgo 3 10. Easy

    [<Test>]
    member this.``it should not be due``() =
        isDue card logs (System.DateTime.Now) |> should be False

[<TestFixture>]
type ``given a hard card studied 3 times 10 days ago``() =
    let (card,logs) = studiedNAgo 3 10. Hard

    [<Test>]
    member this.``it should be due``() =
        isDue card logs (System.DateTime.Now) |> should be True

[<TestFixture>]
type ``given a hard card studied once yesterday``() =
    let (card,logs) = studiedNAgo 1 1. Hard

    [<Test>]
    member this.``it should be due``() =
        isDue card logs (System.DateTime.Now.AddHours(1.)) |> should be True


[<TestFixture>]
type ``given an easy card studied once yesterday``() =
    let (card,logs) = studiedNAgo 1 1. Easy

    [<Test>]
    member this.``it should be due``() =
        isDue card logs (System.DateTime.Now.AddHours(1.)) |> should be True

[<TestFixture>]
type ``given a card studied once 2 days ago``() =
    member this.easyCard = studiedNAgo 1 2. Easy
    member this.hardCard = studiedNAgo 1 2. Hard
    member this.logs = 
        seq { 
            yield! snd this.easyCard
            yield! snd this.hardCard
        }

    [<Test>]
    member this.``easy card is due``() =
        isDue (fst this.easyCard) this.logs System.DateTime.Now |> should be True

    [<Test>]
    member this.``hard card is due``() =
        isDue (fst this.hardCard) this.logs System.DateTime.Now |> should be True
    
[<TestFixture>]
type ``given a card has not been studied``() =
    [<Test>]
    member this.``then it is due``() =
        let (card,logs) = studiedNAgo 0 0. Easy
        isDue card logs System.DateTime.Now |> should be True

    [<Test>]
    member this.``new cards are always due``() =
        Check.QuickThrowOnFailure newCardsAreAlwaysDue

let easyResponseDoesNotChangeEF ef = 
    not (System.Double.IsNaN ef) ==> (eFModifier ef Easy = ef)

[<TestFixture>]
type SpacedRepetition2Tests() = 
    [<Test>]
    member this.Nof1() = 
        Assert.AreEqual(sm2 1 2.5, 1.)

    [<Test>]
    member this.Nof2() = 
        Assert.AreEqual(sm2 2 2.5, 6.)

    [<Test>]
    member this.N3EF25() = 
        Assert.AreEqual(6. * 2.5, sm2 3 2.5)
    
    [<Test>]
    member this.N3EF13() = 
        Assert.AreEqual(6. * 1.3, sm2 3 1.3)

    [<Test>]
    member this.``ef does not change when q = 4``() =        
        Check.QuickThrowOnFailure easyResponseDoesNotChangeEF
