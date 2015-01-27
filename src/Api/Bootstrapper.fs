namespace StudyNotes

open System.IO
open Nancy
open Nancy.TinyIoc
open Nancy.Bootstrapper
open Nancy.Conventions
open Serilog
open Nancy.Responses
open Nancy.Authentication.Forms
open Nancy.Security

type UserMapper() =
    interface IUserMapper with 
        member this.GetUserFromIdentifier(identifier:System.Guid,context) = 
            {new IUserIdentity 
                            with member this.UserName = identifier |> string
                                 member this.Claims = seq {yield "admin"}}

type Bootstrapper() =
    inherit DefaultNancyBootstrapper()

    override this.ConfigureConventions(conventions: NancyConventions) =
        base.ConfigureConventions(conventions)
        conventions.StaticContentsConventions.Add(StaticContentConventionBuilder.AddDirectory("/", "www"))

    override this.RequestStartup(container, pipelines:IPipelines, context) =
//        let file = Path.Combine(System.Environment.GetFolderPath(System.Environment.SpecialFolder.LocalApplicationData), "log-{Date}.txt")
//        let log = (new LoggerConfiguration()).WriteTo.RollingFile(file).CreateLogger()
//        
        let frmCfg = new FormsAuthenticationConfiguration()
        frmCfg.UserMapper <- container.Resolve<IUserMapper>()
        frmCfg.RedirectUrl <- "~/login"
        FormsAuthentication.Enable(pipelines, frmCfg)

        pipelines.OnError.AddItemToEndOfPipeline(fun (ctx:NancyContext) ex -> 
                                                    (*log.Error("Unhandled exception {@ex}", ex);*) ctx.Response)
     
        pipelines.AfterRequest.AddItemToEndOfPipeline(
            fun (ctx:NancyContext) -> 
                ctx.Response
                    .WithHeader("Access-Control-Allow-Origin", "*")
                    .WithHeader("Access-Control-Allow-Methods", "*")
                    .WithHeader("Access-Control-Allow-Headers", "Accept, Origin, Content-type")
                    |> ignore
                ()
            )
        ()

    override this.ConfigureApplicationContainer(container: TinyIoCContainer) =
        container.Register<IUserMapper>(new UserMapper()) |> ignore
        ()


   