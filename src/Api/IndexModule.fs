namespace StudyNotes

open System
open Nancy
open Nancy.ModelBinding
open Nancy.Security

[<CLIMutable>]
type Url = {url:string}

type IndexModule() as x =
    inherit NancyModule()

    let userId() = new Guid(x.Context.CurrentUser.UserName)

    do x.Get.["/"] <- fun _ ->
        x.RequiresAuthentication()
        x.Response.AsRedirect("index.html") |> box
    
    do x.Post.["/import"] <- fun _ ->
        x.RequiresAuthentication()
        let model = x.Bind<Url>()
        UseCases.import model.url (userId())
        x.Response.AsText(model.url) |> box

    do x.Get.["/decks"] <- fun _ ->
        x.RequiresAuthentication()
        x.Response.AsJson(UseCases.listDecks (userId()), HttpStatusCode.OK) |> box
    
    do x.Get.["/cards/{deckid}"] <- fun parameters ->
        x.RequiresAuthentication()
        let deckId = (parameters :?> Nancy.DynamicDictionary).["deckid"] |> string
        let deck = deckId |> UseCases.cardsForStudy
        match deck with
            | UseCases.Success cs -> x.Response.AsJson(cs, HttpStatusCode.OK) |> box
            | UseCases.Error e -> x.Response.AsJson("", HttpStatusCode.InternalServerError) |> box

    do x.Post.["/card/{cardId}/result/{result}"] <- fun p ->
        x.RequiresAuthentication()
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
        x.RequiresAuthentication()
        let url = (x.Request.Query :?> Nancy.DynamicDictionary).["url"] 
                    |> string
        let deck = UseCases.viewDeckByUrl url (userId())
        if Array.isEmpty deck then            
            box HttpStatusCode.NotFound
        else
            x.Response.AsJson(deck, HttpStatusCode.OK) |> box

