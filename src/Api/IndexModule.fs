namespace StudyNotes

open System
open Nancy
open Nancy.ModelBinding
open Nancy.Security
open Auth

[<CLIMutable>]
type Url = {url:string}

type IndexModule() as x =
    inherit NancyModule()

    do x.Get.["/"] <- fun _ ->
        x.Response.AsRedirect("index.html") |> box

    do x.Post.["/import"] <- fun _ ->
        if Auth.isAuthenticated(x) |> not then
            HttpStatusCode.Unauthorized |> box
        else
            let model = x.Bind<Url>()
            UseCases.import model.url (userId(x))
            x.Response.AsText(model.url) |> box

    do x.Get.["/decks"] <- fun _ ->
        if Auth.isAuthenticated(x) |> not then
            HttpStatusCode.Unauthorized |> box
        else
            x.Response.AsJson(UseCases.listDecks (userId(x)), HttpStatusCode.OK) |> box
    
    do x.Get.["/cards/{deckid}"] <- fun parameters ->
        if Auth.isAuthenticated(x) |> not then
            HttpStatusCode.Unauthorized |> box
        else
            let deckId = (parameters :?> Nancy.DynamicDictionary).["deckid"] |> string
            let deck = deckId |> UseCases.cardsForStudy
            match deck with
                | UseCases.Success cs ->                 
                    x.Response.AsJson(SpacedRepetition.processMarkdown cs, HttpStatusCode.OK) |> box
                | UseCases.Error e -> x.Response.AsJson("", HttpStatusCode.InternalServerError) |> box

    do x.Post.["/card/{cardId}/result/{result}"] <- fun p ->
        if Auth.isAuthenticated(x) |> not then
            HttpStatusCode.Unauthorized |> box
        else
            let (cardId, result) = 
                (p :?> Nancy.DynamicDictionary) 
                |> (fun dd -> 
                    (new System.Guid(string dd.["cardId"]), string dd.["result"]))
            UseCases.persistResult cardId (match result with
                                            | s when s = "hard" -> SpacedRepetition.Hard
                                            | s when s = "easy" -> SpacedRepetition.Easy
                                            | _ -> failwith ("unknown result " + result))
            box HttpStatusCode.OK

    do x.Get.["/deck"] <- fun _ ->
        if Auth.isAuthenticated(x) |> not then
            HttpStatusCode.Unauthorized |> box
        else
            let url = (x.Request.Query :?> Nancy.DynamicDictionary).["url"] 
                        |> string
            let deck = UseCases.viewDeckByUrl url (userId(x))
            if Array.isEmpty deck then            
                box HttpStatusCode.NotFound
            else
                x.Response.AsJson(deck, HttpStatusCode.OK) |> box

    do x.Post.["/sync/{deckId}"] <- fun p ->
        let deckId = new System.Guid((p :?> Nancy.DynamicDictionary).["deckId"] |> string)
        match UseCases.sync deckId (Auth.userId(x)) with
            | UseCases.Success _ -> HttpStatusCode.OK |> box
            | UseCases.Error m -> x.Response.AsJson(m, HttpStatusCode.InternalServerError) |> box

