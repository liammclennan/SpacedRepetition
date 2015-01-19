// how to reference FParsec in fsi
// #r @"C:\work\SpacedRepetition\SpacedRepetition\packages\\FParsec.1.0.1\lib\net40-client\FParsecCS.dll";;
// #r @"C:\work\SpacedRepetition\SpacedRepetition\packages\\FParsec.1.0.1\lib\net40-client\FParsec.dll";;
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
