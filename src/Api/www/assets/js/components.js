define('components', ['euclid','urls','auth'], function (euclid, urls, auth) {
    var R = React.DOM;

    var formMixin = {
        refsObject: function (spec) {
            var result = {};
            Object.keys(spec).forEach(function (key) {
                result[key] = getValue(this.refs[key].getDOMNode().value, key);
            }, this);

            return result;

            function getValue(raw, key) {
                var validators = spec[key];
                var typeValidators = validators.filter(function (validator) {
                    return validator.validator == 'type';
                });
                if (typeValidators.length) {
                    var mapping = {
                        'number': parseFloat,
                        'boolean': function (s) {
                            switch (s) {
                                case "true":
                                    return true;
                                case "false":
                                    return false;
                                default:
                                    return s;
                            }
                        }
                    };
                    var type = typeValidators[0].args[0];
                    return (mapping[type] || function (i) { return i; })(raw);
                }
                return raw;
            }
        },
        clearInputs: function (refs) {
            Object.keys(refs).forEach(function (key) {
                var el = refs[key].getDOMNode();
                el.value = '';
            });
        },
        bindToState: function (stateProperty) {
            var comp = this;
            return function (e) {
                var o = {};
                o[stateProperty] = e.target.value;
                comp.setState(o);
            }
        },
        addControlProps: function (props, stateProperty) {
            props.className = (props.className || '') + 'form-control';
            props.value = this.state[stateProperty];
            props.onChange = this.bindToState(stateProperty);
            return props;
        }
    };

    var DeckListItem = React.createFactory(React.createClass({
        propTypes: {
            deck: React.PropTypes.object.isRequired
        },
        render: function () {
            return R.div({className: 'col-md-4 col-sm-6', onClick: this.go}, 
                R.div({className: 'deck-list-item'},
                    R.a({href: '#', onClick: this.go}, this.props.deck.name + ' ', R.span({className: 'badge'}, this.props.count))));
        },
        go: function (e) {
            e.preventDefault();
            euclid.navigate('Deck', {url: urls.encodeForPath(this.props.deck.sourceUrl)});
        }
    }));

    var LoginPage = React.createFactory(React.createClass({
        getInitialState: function () {
            return {email:''};
        },
        render: function () {
            return R.section(
                {className:'text-center'},
                R.h2(null, 'Login'),
                R.hr({className:'star-primary'}),
                this.props.message ? this.props.message :
                R.form({ className: 'form-inline', onSubmit: this.import },
                    R.div({ className: 'form-group' },
                        R.input({ type: 'email', className: 'form-control', placeholder: 'email', value: this.state.email, onChange: this.bindToState('email') }),
                        R.button({className: 'btn btn-default'}, 'Login')
                    )
                )
            );
        },
        'import': function (e) {
            e.preventDefault();
            euclid.action('login', this.state.email);
        },
        mixins: [formMixin]
    }));


    var Home = React.createFactory(React.createClass({
        displayName: 'Home',        
        propTypes: {
            decks: React.PropTypes.array.isRequired
        },
        render: function () {
            return R.div({className:'row'}, R.div(
                {className:'text-center col-md-12'},
                R.h2({ className:""}, 'Notebooks'),
                R.hr({className:'star-primary'}),                
                R.div({className: 'row', style: {'marginTop': '30'}}, 
                    this.props.decks.length 
                    ? this.props.decks.map(function (deckWithCount) {
                        deckWithCount.key = deckWithCount.deck.id;
                        return DeckListItem(deckWithCount);
                    })
                    : [R.p({key:1}, 
                        "You do not have any notebooks. Why not ",
                        R.a({href:'#/import'}, "import a notebook"), "?"
                    ), R.p({key:2}, 'or ', R.button({className:'btn btn-default', onClick: euclid.action.bind(euclid, 'importDemo')},'Load a demo notebook'))]
                )
            ));
        }
    }));

    var NotAuthenticated = React.createFactory(React.createClass({
        render: function () {
            return R.div(null, R.section(
                {className:'row text-center hero hidden-xs'},
                R.h2({ className:""}, 'Study notes and flash cards'),
                R.hr({className:'star-primary'})),                
                R.div({className: 'col-md-6 copy'},  
                    R.p(null,'Study Notes is an easy place to keep your study notes and flash cards.'),
                    R.p(null, 'Study notes uses ', R.a({href:'http://en.wikipedia.org/wiki/Spaced_repetition',target:'other'},'spaced repetition'), ' - a learning technique that incorporates increasing intervals of time between subsequent review of previously learned material.'),
                    R.div(null, R.a({href: '#/getstarted', className:'btn btn-primary'}, 'Get Started'))),
                R.div({className:'col-md-6 hidden-xs copy'},
                    R.p(null, R.img({src:'assets/img/mlkcard.png', style: {width: 350}}))));
        }
    }));

    var GetStarted = React.createFactory(React.createClass({
        render: function () {
            return R.div({className:'row'},
                R.div({className:'col-md-6'}, 
                    R.h3(null, 'Getting Started'),
                    R.ul({className:'get-started-list'}, 
                        R.li(null, 'Record your notes in a ', 
                            R.a({href:'http://github.com',target:'other'}, 'public git wiki'),
                            R.p(null, 
                                R.a({href:'https://github.com/liammclennan/maths/wiki',target:'other'}, 'This is an example of a public git wiki'))),   
                        R.li(null, 'Add flash card data', 
                            R.p(null, 'Flash card data is recorded directly in the study notes, alongside the notes themselves. To specify the front of a card use:'),
                            R.p({className:'well well-lg'}, 'Q>>> Is this a good question? <<<'),
                            R.p(null, 'and for the back of the card...'),
                            R.p({className:'well well-lg'}, 'A>>> Yes. Yes it is <<<')
                        ),
                        R.li(null, R.a({href:'#/login'},'Login'),' to Study Notes to create your account'),
                        R.li(null, 
                            R.a({href:'#/import'},'Import'), 
                            ' your wiki and start studying')
                    )
                )
            );
        }
    }));

    var Import = React.createFactory(React.createClass({
        getInitialState: function () {
            return { importUrl: '' };
        },
        render: function () {
            return R.section(
                {className:'text-center'},
                R.h2(null, 'Import a Notebook'),
                R.hr({className:'star-primary'}),
                R.form({ className: 'form-inline', onSubmit: this.import },
                    R.div({ className: 'form-group' },
                        R.input({ type: 'text', className: 'form-control', placeholder: 'notebook git url', value: this.state.importUrl, onChange: this.bindToState('importUrl') }),
                        R.button({className: 'btn btn-default'}, 'Import Notebook')
                    )
                )
            );
        },
        'import': function (e) {
            e.preventDefault();
            euclid.action('importWiki', this.state.importUrl);
        },
        mixins: [formMixin]
    }));

    var AsycContent = React.createFactory(React.createClass({
        render: function () {
            return _.isEqual(["children"], Object.keys(this.props)) 
                ? R.span(null,'...') 
                : R.span(null, this.props.children);
        }
    }));

    var Deck = React.createFactory(React.createClass({
        componentWillMount: function () {
            euclid.action('loadCards');
        },
        getInitialState: function () {
            return {
                name: this.props.deck.name,
                editingName:false
            };
        },
        render: function () {
            return R.section(null, 
                
                this.state.editingName 
                    ? R.div(null,
                        R.div({className: 'col-xs-10'}, R.input({className: 'form-control', type:'text', value:this.state.name,  onChange: this.bindToState('name')})),
                        R.div({className: 'col-xs-2'}, R.button({className: 'btn btn-primary',onClick:this.saveNameClicked}, 'Save')))

                    
                    : R.h3({onClick: this.titleClicked}, this.state.name),                
                R.p(null, this.props.deck.sourceUrl),
                R.div(null, AsycContent(this.props.cards, 'Total cards ' + this.props.cards.length)),
                R.div(null, 
                    R.button({onClick: euclid.action.bind(euclid, 'study', this.props.deck.id), className:'btn btn-primary'}, 'Study Now'),
                    R.span(null, ' '), 
                    R.button({onClick: euclid.action.bind(euclid,'viewNotebook'), className:'btn btn-default'}, 'View Notebook'),
                    R.span(null, ' '),
                    R.button({onClick: euclid.action.bind(euclid, 'sync', this.props.deck.id), className:'btn btn-default'}, 'Sync Now')
                )
            );
        },
        titleClicked: function () {
            this.setState({editingName: !this.state.editingName});
        },
        saveNameClicked: function () {
            this.setState({editingName: !this.state.editingName});
            euclid.action('saveNameChange', this.state.name);
        },
        mixins: [formMixin]
    }));

    var Card = React.createFactory(React.createClass({
        displayName: 'Card',
        getInitialState: function () {
            return {showingFront: true};
        },
        componentWillMount: function () {
            Mousetrap.bind('space', this.clicked);
            Mousetrap.bind('left', this.thumbsDown);
            Mousetrap.bind('right', this.thumbsUp);
        },
        componentWillReceiveProps: function () {
            this.setState(this.getInitialState());
        },
        render: function () {
            return R.div({id:'card'}, 
                R.div({onClick: this.clicked, className:'card'}, 
                    R.div({className:'card-inner' + (this.state.showingFront ? '' : ' card-flip')},
                        this.state.showingFront ? R.div({className: 'card-inner-inner front', dangerouslySetInnerHTML: {__html: this.props.front}}) : '',
                        this.state.showingFront ? '' : R.div({className: 'card-inner-inner back', dangerouslySetInnerHTML: {__html: this.props.back}})
                    )),

                R.div({className:'row'}, 
                    R.div({style:{visibility: this.state.showingFront ? 'hidden' : 'visible', padding: '15' }}, 
                        R.button({onClick: this.thumbsDown, type:'button', className:'btn btn-danger btn-lg pull-left'}, R.span({className:'glyphicon glyphicon-thumbs-down'})),
                        R.button({onClick: this.thumbsUp, type:'button', className:'btn btn-success btn-lg pull-right'}, R.span({className:'glyphicon glyphicon-thumbs-up'})))),
                R.div(null, 
                    R.p(null, 'Keyboard shortcuts'), 
                    R.ul(null, 
                        R.li(null, 'space to flip'),
                        this.state.showingFront ? '' : R.li(null, 'left arrow = difficult'),
                        this.state.showingFront ? '' : R.li(null, 'right arrow = easy')))
            );
        },
        componentDidMount: function () {
            MathJax.Hub.Queue(["Typeset",MathJax.Hub,'card']);
        },
        componentDidUpdate: function (prevProps, prevState) {
            MathJax.Hub.Queue(["Typeset",MathJax.Hub,'card']);
        },
        clicked: function () {
            this.setState({showingFront: !this.state.showingFront});
        },
        thumbsDown: function () {
            if (this.state.showingFront) return;
            euclid.action('cardWasHard', this.props.id);
        },
        thumbsUp: function () {
            if (this.state.showingFront) return;
            euclid.action('cardWasEasy', this.props.id);
        },
        componentWillUnmount: function () {
            Mousetrap.reset();
        }
    }));

    var Study = React.createFactory(React.createClass({
        displayName: 'Study',
        propTypes: {
            index: React.PropTypes.number.isRequired,
            cards: React.PropTypes.array.isRequired
        },
        render: function () {
            return R.div({className:'row'}, 
                    R.div({className: 'col-md-8 col-md-offset-2 col-sm-10 col-sm-offset-1'}, 
                        R.section(null, 
                            this.props.cards.length 
                            ? Card(this.props.cards[this.props.index])
                            : 'No cards')))
                ;
        }
    }));

    var Help = React.createFactory(React.createClass({
        displayName: 'Study',
        propTypes: {
            index: React.PropTypes.number.isRequired,
            cards: React.PropTypes.array.isRequired
        },
        render: function () {
            return R.div({className:'row'}, 
                    R.div({className:'col-md-2',id:'toc'}),
                    R.div({className: 'col-md-10'}, 
                        R.section({className:'text-center'},
                            R.h2(null, 'Help'),
                            R.hr({className:'star-primary'})),
                        R.section({id:'contents'}, 
                            R.h2(null, "Notebooks"),
                            R.p(null, 'Notebooks are collections of flash cards. Each notebook is bound to a ',
                                R.a({href:'http://en.wikipedia.org/wiki/Wiki',target:'other'}, 'wiki'),
                                ' via the git interface.'),
                            R.p(null, 'The easiest way to create a new git wiki for use with study notes is to ',
                                R.a({href:'https://github.com/',target:'other'}, 'signup for a free account with github'), 
                                ' and create a new git repository with a wiki. Once you have a wiki you can copy its clone url from github (see image below).'),
                            R.img({src:'assets/img/githubclone.gif',style:{'boxShadow': '3px 3px 10px #888888;',border:'1px solid #666;',margin:'20px;'}}),
                            R.p(null,'Once you have a git wiki url you can create a notebook using the ',
                                R.a({href:'#/import'}, 'import'), ' function.'),
                            R.h3(null,'Importing a Notebook'),
                            R.ol(null, R.li(null,'Find the url of a git wiki'), R.li(null,'Enter the wiki url in the StudyNotes ', R.a({href:'#/import'}, 'import'), ' text field'), R.li(null, 'Click the "Import" button')),
                            R.h3(null, 'Adding Flash Cards'),
                            R.p(null, 
                                'The intention of StudyNotes is to combine study notes and flash card data together, so that each appears in context. When you make changes to your notes it is a reminder to update your flash cards.  To add a question edit your wiki and enter a question like so:',
                                R.div({className: 'panel panel-default'}, 
                                    R.div({className: 'panel-heading'}, 'How to enter a question'),
                                    R.div({className: 'panel-body'}, 'Q>>> My question goes here? <<<')),
                                R.p(null,'Use a similar syntax for the corresponding answer:'),
                                R.div({className: 'panel panel-default'}, 
                                    R.div({className: 'panel-heading'}, 'How to enter an answer'),
                                    R.div({className: 'panel-body'}, 'A>>> My answer goes here? <<<')),
                                R.p(null, 'When you select your notebook in StudyNotes you will see a "Sync Now" button. Click this button and your new flash card will be added to the notebook. Content between Q>>> and <<< will become the front of a flash card. Content between A>>> and <<< will become the back of a flashcard.'),
                                R.h4(null, 'Advanced'),
                                R.p(null, "If you want your flash card questions and answers to be hidden when viewing your wiki you can surround them with script tags:"),
                                R.div({className: 'panel panel-default'}, 
                                    R.div({className: 'panel-heading'}, 'How to hide flash card questions and answers'),
                                    R.div({className: 'panel-body',dangerouslySetInnerHTML:{__html: '&lt;script&gt;<br/>Q>>> My question goes here? <<<<br/>A>>> My answer goes here <<<<br/>&lt;/script&gt;'}}))
                            )
                        )))
                ;
        }
    }));

    return {
        Home: Home,
        NotAuthenticated: NotAuthenticated,
        GetStarted: GetStarted,
        Import: Import,
        Deck: Deck,
        Study: Study,
        LoginPage: LoginPage,
        Help: Help
    };
});