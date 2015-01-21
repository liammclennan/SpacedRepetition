namespace StudyNotes

open System
open Nancy
open Nancy.ModelBinding
open Operators

[<CLIMutable>]
type Url = {url:string}

type IndexModule() as x =
    inherit NancyModule()
    
    do x.Post.["/import"] <- fun _ ->
        let model = x.Bind<Url>()
        UseCases.import model.url
        x.Response.AsText(model.url) |> box

    do x.Get.["/decks"] <- fun _ ->
        x.Response.AsJson(UseCases.listDecks, HttpStatusCode.OK) |> box
    
    do x.Get.["/cards/{deckid}"] <- fun parameters ->
        System.Threading.Thread.Sleep(2000)
        let deckId = (parameters :?> Nancy.DynamicDictionary).["deckid"] |> string
        let deck = deckId |> UseCases.viewCardsByDeck
        match deck with
            | UseCases.Success cs -> x.Response.AsJson(cs, HttpStatusCode.OK) |> box
            | UseCases.Error e -> x.Response.AsJson("", HttpStatusCode.InternalServerError) |> box

    do x.Get.["/deck"] <- fun _ ->
        let url = (x.Request.Query :?> Nancy.DynamicDictionary).["url"] 
                    |> string
        let deck = url |> UseCases.viewDeckByUrl
        if Array.isEmpty deck then            
            box HttpStatusCode.NotFound
        else
            x.Response.AsJson(deck, HttpStatusCode.OK) |> box

