module Program

[<EntryPoint>]
let main argv = 
    if Array.length argv = 0 then 
        printfn "Usage: SpacedRepetition <giturl>"
        1
    else
        let repoDir = Git.fetch argv.[0]
        let files = FileSource.getMdFiles repoDir
        let srs = Map.map (fun k v -> Parser.parse v) files
        Writer.writeCsv srs
        0 // return an integer exit code
