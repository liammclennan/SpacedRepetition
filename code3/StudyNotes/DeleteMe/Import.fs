namespace UseCases
open Parser
open PostgresDoc.Doc

module Import =
    type Card = { id:System.Guid; front: string; back: string; imported: System.DateTime}
    let private store = { connString = "Server=127.0.0.1;Port=5432;User Id=test;Password=test;Database=StudyNotes;" }

    let import url = 
        let repoDir = Git.fetch url
        let pathToFiles = FileSource.getMdFiles repoDir
        let uow = pathToFiles
                    |> Map.toList
                    |> List.map (fun (path,content) -> content)
                    |> List.map Parser.parse
                    |> List.concat
                    |> List.map (fun (q,a) -> { id = System.Guid.NewGuid(); front = q; back = a; imported = System.DateTime.Now})
                    |> List.map (fun card -> insert card.id card)
        commit store uow
        ()
