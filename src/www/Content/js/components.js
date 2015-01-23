define('components', ['euclid','urls'], function (euclid, urls) {
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
            return R.td(null, R.a({href: '#' + euclid.state('Deck', {url: urls.encodeForPath(this.props.sourceUrl)})}, this.props.name));
        }
    }));

    var Home = React.createFactory(React.createClass({
        displayName: 'Home',
        getInitialState: function () {
            return { importUrl: '' };
        },
        propTypes: {
            decks: React.PropTypes.array.isRequired
        },
        render: function () {
            return R.section(
                {className:'text-center'},
                R.h2({ className:""}, 'Wikis'),
                R.hr({className:'star-primary'}),
                R.form({ className: 'form-inline', onSubmit: this.import },
                    R.div({ className: 'form-group' },
                        R.input({ type: 'text', className: 'form-control', placeholder: 'wiki git url', value: this.state.importUrl, onChange: this.bindToState('importUrl') }),
                        R.button({className: 'btn btn-default'}, 'Import Wiki'))),
                
                R.table({className:'table table-striped',style: {'marginTop': '30'}}, 
                    R.tr(null, this.props.decks.map(function (deck) {
                        deck.key = deck.id;
                        return DeckListItem(deck);
                    }))
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
                R.h3(null, this.props.deck.name),
                R.button(this.notImplementedProps, 'Sync Now'),
                R.p(null, this.props.deck.sourceUrl),
                R.div(null, AsycContent(this.props.cards, 'Total cards ' + this.props.cards.length)),
                R.div(null, 
                    R.button({onClick: euclid.action.bind(euclid, 'study', this.props.deck.id), className:'btn btn-primary'}, 'Study Now'),
                    R.span(null, ' '), 
                    R.button({onClick:function () {alert('not implemented');}, className:'btn btn-default'}, 'View Wiki')
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
            return R.div(null, 
                
                R.div({onClick: this.clicked, className:'card'}, 
                    R.div({className:'card-inner' + (this.state.showingFront ? '' : ' card-flip')},
                        this.state.showingFront ? R.div({className: 'card-inner-inner front'}, this.props.front) : '',
                        this.state.showingFront ? '' : R.div({className: 'card-inner-inner back'}, this.props.back + "It is surprisingly good. Can I use... is always great for checking out the details there. On desktop the concerns would be it's IE 9+, Safari 6+, and won't be in Opera until it is on Blink in 15+. On mobile, Android and Opera Mini don't support it at all yet and iOS just on 6.0+.")
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

    return {
        Home: Home,
        Deck: Deck,
        Study: Study
    };
});