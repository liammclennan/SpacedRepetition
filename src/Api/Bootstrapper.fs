namespace StudyNotes

open Nancy
open Nancy.TinyIoc
open Nancy.Bootstrapper
open Nancy.Conventions

type Bootstrapper() =
    inherit DefaultNancyBootstrapper()

    override this.ConfigureConventions(conventions: NancyConventions) =
        base.ConfigureConventions(conventions)
        conventions.StaticContentsConventions.Add(StaticContentConventionBuilder.AddDirectory("", "www", "html","css","png","js","woff"))

    override this.RequestStartup(container, pipelines, context) = 
        pipelines.AfterRequest.AddItemToEndOfPipeline(
            fun ctx -> 
                ctx.Response
                    .WithHeader("Access-Control-Allow-Origin", "*")
                    .WithHeader("Access-Control-Allow-Methods", "*")
                    .WithHeader("Access-Control-Allow-Headers", "Accept, Origin, Content-type")
                    |> ignore
                ()
            )
        ()

   