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
            name: React.PropTypes.string.isRequired,
            sourceUrl: React.PropTypes.string.isRequired
        },
        render: function () {
            return R.div({className: 'col-md-4 deck-list-item col-sm-6', onClick: this.go}, R.a({href: '#'}, this.props.name));
        },
        go: function () {
            euclid.navigate('Deck', {url: urls.encodeForPath(this.props.sourceUrl)});
        }
    }));

    var Home = React.createFactory(React.createClass({
        displayName: 'Home',        
        propTypes: {
            decks: React.PropTypes.array.isRequired
        },
        render: function () {
            return R.div({className:'row'}, R.section(
                {className:'text-center'},
                R.h2({ className:""}, 'Notebooks'),
                R.hr({className:'star-primary'}),                
                R.div({className: 'col-md-12', style: {'marginTop': '30'}}, 
                    this.props.decks.map(function (deck) {
                        deck.key = deck.id;
                        return DeckListItem(deck);
                    })
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
                        R.li(null, 'Record your notes in a ', R.a({href:'http://github.com',target:'other'}, 'public git wiki')),
                        R.li(null, 'Add flash card data', 
                            R.p(null, 'Flash card data is recorded directly in the study notes, alongside the notes themselves. To specify the front of a card use:'),
                            R.p(null, 'Q>>> Is this a good question? <<<'),
                            R.p(null, 'A>>> Yes. Yes it is <<<')
                        ),
                        R.li(null, R.a({href:'#',onClick: function (e) {navigator.id.request();e.preventDefault();}},'Login'),' to Study Notes to create your account'),
                        R.li(null, 'Import your wiki and start studying')
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
        render: function () {
            return R.section(null, 
                R.button({onClick: euclid.action.bind(euclid, 'sync', this.props.deck.id), className:'btn btn-default pull-right'}, 'Sync Now'),
                R.h3(null, this.props.deck.name),                
                R.p(null, this.props.deck.sourceUrl),
                R.div(null, AsycContent(this.props.cards, 'Total cards ' + this.props.cards.length)),
                R.div(null, 
                    R.button({onClick: euclid.action.bind(euclid, 'study', this.props.deck.id), className:'btn btn-primary'}, 'Study Now'),
                    R.span(null, ' '), 
                    R.button({onClick:function () {alert('not implemented');}, className:'btn btn-default'}, 'View Notebook')
                )
            );
        },
        notImplementedProps: {onClick:function () {alert('not implemented');}, className: 'btn btn-default'}
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
                    R.div({className: 'col-md-6 col-md-offset-3'}, 
                        R.section(null, 
                            this.props.cards.length 
                            ? Card(this.props.cards[this.props.index])
                            : 'No cards')))
                ;
        }
    }));

    var Login = React.createFactory(React.createClass({
        render: function () {
            return auth.isAuthenticated() 
                    ? R.a({href:'#', onClick: auth.logout.bind(auth)}, auth.user()) 
                    : R.a({href:'#', onClick: function () {navigator.id.request();}},'Log in');
        }
    }));

    return {
        Home: Home,
        NotAuthenticated: NotAuthenticated,
        GetStarted: GetStarted,
        Import: Import,
        Deck: Deck,
        Study: Study,
        Login: Login
    };
});