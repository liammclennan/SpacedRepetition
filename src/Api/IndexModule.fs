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
    
    do x.Get.["/deck"] <- fun _ ->
        let url = (x.Request.Query :?> Nancy.DynamicDictionary).["url"] 
                    |> string
        let deck = url |> UseCases.viewDeck
        if Array.isEmpty deck then            
            box HttpStatusCode.NotFound
        else
            x.Response.AsJson(deck, HttpStatusCode.OK) |> box

