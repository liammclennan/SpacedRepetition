module Writer

let writeCsv qs =
    use tw = System.IO.File.CreateText("data.csv")
    let csv = new CsvHelper.CsvWriter(tw)
    csv.Configuration.HasHeaderRecord <- false
    Map.toList qs
        |> List.map (fun (k,v) -> v)
        |> List.concat
        |> csv.WriteRecords