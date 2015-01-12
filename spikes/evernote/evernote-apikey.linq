<Query Kind="Statements">
  <NuGetReference>evernote-cloud-sdk-windows</NuGetReference>
  <Namespace>EvernoteSDK</Namespace>
  <Namespace>EvernoteSDK.Advanced</Namespace>
  <Namespace>Evernote.EDAM.NoteStore</Namespace>
</Query>

ENSessionAdvanced.SetSharedSessionConsumerKey("liammclennan3", "dad30de2bcf630c1","sandbox.evernote.com");

if (ENSession.SharedSession.IsAuthenticated == false)
{
    ENSession.SharedSession.AuthenticateToEvernote();
}
ENSession.SharedSession.ListNotebooks().Dump();

ENNoteStoreClient store = ENSessionAdvanced.SharedSession.PrimaryNoteStore;
store.FindNotes(new NoteFilter { Words="Evernote" },0,1000).Dump();
//store.GetNote("b81b0fae-d118-43e8-b506-1c54cbddd05b",true,true,true,true).Dump();

//ENSessionAdvanced.SharedSession.ListNotebooks().Dump();
//ENSessionAdvanced.SharedSession.FindNotes(ENNoteSearch.NoteSearch("calamari"), ENSessionAdvanced.SharedSession.ListNotebooks().First(), ENSession.SearchScope.None, ENSession.SortOrder.Normal, 20);


ENNoteStoreClient PrimaryNoteStore;
ENNoteStoreClient BusinessNoteStore;
//ENNoteStoreClient NoteStoreForLinkedNotebook(linkedNotebook);