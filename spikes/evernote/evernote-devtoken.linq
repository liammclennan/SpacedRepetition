<Query Kind="Statements">
  <NuGetReference>evernote-cloud-sdk-windows</NuGetReference>
  <Namespace>EvernoteSDK</Namespace>
  <Namespace>EvernoteSDK.Advanced</Namespace>
  <Namespace>Evernote.EDAM.NoteStore</Namespace>
</Query>

ENSessionAdvanced.SetSharedSessionDeveloperToken("S=s57:U=65a720:E=15237f997d4:C=14ae0486ad0:P=1cd:A=en-devtoken:V=2:H=0088dfe8c5eef4985bf0220f92c6a315", "https://www.evernote.com/shard/s57/notestore");
//ENSession.SharedSession.ListNotebooks().Dump();

ENNoteStoreClient store = ENSessionAdvanced.SharedSession.PrimaryNoteStore;
store.FindNotes(new NoteFilter { Words="Evernote" },0,1000).Notes.Select(n => store.GetNoteContent(n.Guid)).Dump();
//store.GetNote("b81b0fae-d118-43e8-b506-1c54cbddd05b",true,true,true,true).Dump();

//ENSessionAdvanced.SharedSession.ListNotebooks().Dump();
//ENSessionAdvanced.SharedSession.FindNotes(ENNoteSearch.NoteSearch("calamari"), ENSessionAdvanced.SharedSession.ListNotebooks().First(), ENSession.SearchScope.None, ENSession.SortOrder.Normal, 20);


ENNoteStoreClient PrimaryNoteStore;
ENNoteStoreClient BusinessNoteStore;
//ENNoteStoreClient NoteStoreForLinkedNotebook(linkedNotebook);