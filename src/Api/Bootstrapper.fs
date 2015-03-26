namespace StudyNotes

open System
open System.IO
open Nancy
open Nancy.TinyIoc
open Nancy.Bootstrapper
open Nancy.Conventions
open Serilog
open Nancy.Responses
open Nancy.Security
open Nancy.Cryptography
open Nancy.Authentication.Forms

type Bootstrapper() =
    inherit DefaultNancyBootstrapper()

    override this.ConfigureConventions(conventions: NancyConventions) =
        base.ConfigureConventions(conventions)
        conventions.StaticContentsConventions.Add(StaticContentConventionBuilder.AddDirectory("/", "www"))

    override this.RequestStartup(container, pipelines:IPipelines, context) =
//        let file = Path.Combine(System.Environment.GetFolderPath(System.Environment.SpecialFolder.LocalApplicationData), "log-{Date}.txt")
//        let log = (new LoggerConfiguration()).WriteTo.RollingFile(file).CreateLogger()
//        
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
        ()

    override this.ApplicationStartup(container, pipelines: IPipelines) =
        let cryptographyConfiguration = 
            new CryptographyConfiguration(
             new RijndaelEncryptionProvider(
              new PassphraseKeyGenerator("hWgOpkzdeONe9b28e16093c43838cf3b25c9b43a140qmslqIunl", [|64uy;222uy;33uy;95uy;139uy;19uy;83uy;39uy;208uy;19uy;204uy;254uy;34uy;25uy;167uy; 163uy|])),
               new DefaultHmacProvider(new PassphraseKeyGenerator("pTKSrVPkwi57036c527892d4b93b829be84478258caRK0BQVFNXpn", [|77uy;1uy;101uy;28uy;99uy;19uy;44uy;43uy;20uy;4uy;|])));

        let conf = new FormsAuthenticationConfiguration() 
        conf.CryptographyConfiguration <- cryptographyConfiguration
        conf.RedirectUrl <- "~/login"
        conf.UserMapper <- { new IUserMapper with 
                                member x.GetUserFromIdentifier((identifier:Guid), (context:NancyContext)) = 
                                    { new IUserIdentity with 
                                        member y.UserName = identifier.ToString()
                                        member y.Claims = Seq.empty }
                                }
        FormsAuthentication.Enable(pipelines, conf)
        StaticConfiguration.DisableErrorTraces <- false
        UseCases.init()
        


   