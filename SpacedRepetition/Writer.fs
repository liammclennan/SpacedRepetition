module Writer

let writeCsv qs =
    use tw = System.IO.File.CreateText("data.csv")
    let csv = new CsvHelper.CsvWriter(tw)
    csv.Configuration.HasHeaderRecord <- false
    csv.WriteRecords qs