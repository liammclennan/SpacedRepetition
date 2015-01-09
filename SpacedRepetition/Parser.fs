module Parser

open FParsec    

let pfront = attempt (charsTillString "Q>>>" false 100000) <|> ((many anyChar) |>> (fun cs -> new string (Array.ofList cs)))
let pq = pstring "Q>>>" >>. spaces >>. (charsTillString "<<<" false 1000000) .>> pstring "<<<" .>> spaces
let pa = pstring "A>>>" >>. spaces >>. (charsTillString "<<<" false 1000000) .>> pstring "<<<"
let pqa = pq .>>. pa
let pqas1 = many (pfront >>. (pqa .>> pfront) .>> pfront)
let pqas = (attempt pqas1 <|> (preturn [])) 

let parse text = 
    match run pqas text with
    | Success(qs, _, _)   -> qs
    | Failure(errorMsg, _, _) -> []
