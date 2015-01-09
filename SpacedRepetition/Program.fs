module Program

[<EntryPoint>]
let main argv = 
    if Array.length argv = 0 then 
        printfn "Usage: SpacedRepetition <giturl>"
        1
    else
        let repoDir = Git.fetch argv.[0]
        let files = FileSource.getMdFiles repoDir
        let srs = files
                  |> Map.toList
                  |> List.map (fun (path,content) -> content)
                  |> List.map Parser.parse
                  |> List.concat
        Writer.writeCsv srs
        0 // return an integer exit code
