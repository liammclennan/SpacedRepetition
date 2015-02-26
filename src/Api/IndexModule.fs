namespace StudyNotes
open System
open Nancy
open Nancy.ModelBinding
open Nancy.Security

[<CLIMutable>]
type Url = {url:string}
[<CLIMutable>]
type DeckName = {name:string}

type IndexModule() as x =
    inherit NancyModule()

    let userId() = new Guid(x.Context.CurrentUser.UserName)        

    do x.RequiresAuthentication()

    do x.Post.["/import"] <- fun _ ->
        let model = x.Bind<Url>()
        UseCases.import model.url (userId())
        x.Response.AsText(model.url) |> box

    do x.Get.["/decks"] <- fun _ ->
        x.RequiresAuthentication()
        x.Response.AsJson(UseCases.listDecks (userId()), HttpStatusCode.OK) |> box
    
    do x.Get.["/cards/{deckid}"] <- fun parameters ->
        let deckId = (parameters :?> Nancy.DynamicDictionary).["deckid"] |> string
        let deck = UseCases.cardsForStudy (userId()) deckId
        match deck with
            | UseCases.Success cs ->                 
                x.Response.AsJson(SpacedRepetition.processMarkdown cs, HttpStatusCode.OK) |> box
            | UseCases.Error e -> x.Response.AsJson(e, HttpStatusCode.InternalServerError) |> box

    do x.Post.["/card/{cardId}/result/{result}"] <- fun p ->
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
        let url = (x.Request.Query :?> Nancy.DynamicDictionary).["url"] 
                    |> string
        let deck = UseCases.viewDeckByUrl url (userId())
        if Array.isEmpty deck then            
            box HttpStatusCode.NotFound
        else
            x.Response.AsJson(deck, HttpStatusCode.OK) |> box

    do x.Post.["/deck/{deckId}/name"] <- fun p ->
        let deckId = new System.Guid((p :?> Nancy.DynamicDictionary).["deckId"] |> string)
        let {name = name} = x.Bind<DeckName>()
        match UseCases.changeDeckName deckId name with
            | UseCases.Success _ -> x.Response.AsJson("") |> box
            | UseCases.Error e -> x.Response.AsJson(e) |> box

    do x.Post.["/sync/{deckId}"] <- fun p ->
        let deckId = new System.Guid((p :?> Nancy.DynamicDictionary).["deckId"] |> string)
        match UseCases.sync deckId (userId()) with
            | UseCases.Success _ -> HttpStatusCode.OK |> box
            | UseCases.Error m -> x.Response.AsJson(m, HttpStatusCode.InternalServerError) |> box

