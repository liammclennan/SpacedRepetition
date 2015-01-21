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
            return R.li(null, R.a({href: '#' + euclid.state('Deck', {url: urls.encodeForPath(this.props.sourceUrl)})}, this.props.name));
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
            return React.DOM.div(
                null,
                R.form({ className: 'form-inline', onSubmit: this.import },
                    R.div({ className: 'form-group' },
                        R.input({ type: 'text', className: 'form-control', placeholder: 'wiki git url', value: this.state.importUrl, onChange: this.bindToState('importUrl') }),
                        R.button(null, 'Import Wiki'))),
                R.div(null, 'or'),
                R.form({ className: 'form-inline' },
                    R.div({ className: 'form-group' },
                        R.input({ type: 'text', className: 'form-control', placeholder: 'wiki name' }),
                        R.button(null, 'Return to Wiki'))),
                R.div(null, 
                    R.h2(null, 'Wikis'),
                    R.ul(null, this.props.decks.map(function (deck) {
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
            return R.div(null, 
                R.h1(null, this.props.deck.name),
                R.button(this.notImplementedProps, 'Sync Now'),
                R.p(null, this.props.deck.sourceUrl),
                R.div(null, AsycContent(this.props.cards, 'Total cards ' + this.props.cards.length)),
                R.div(null, 
                    R.button({onClick: euclid.action.bind(euclid, 'study', this.props.deck.id)}, 'Study Now'), 
                    R.button({onClick:function () {alert('not implemented');}}, 'View Wiki')
                )
            );
        },
        notImplementedProps: {onClick:function () {alert('not implemented');}}
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
            return R.div({onClick: this.clicked}, 
                R.div(null, 
                    this.state.showingFront ? this.props.front : this.props.back),
                    this.state.showingFront ? '' : R.div(null, 
                        R.button({onClick: this.thumbsDown}, 'thumbs down'), 
                        R.button({onClick: this.thumbsUp}, 'thumbs up')),
                    R.div(null, 
                        R.p(null, 'Keyboard shortcuts'), 
                        R.ul(null, 
                            R.li(null, 'Press space or click the card to flip it'),
                            this.state.showingFront ? '' : R.li(null, 'Use the left arrow to indicate that the card is difficult'),
                            this.state.showingFront ? '' : R.li(null, 'Use the right arrow to indicate that the card is easy')))
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
            var card = this.props.cards[this.props.index];
            return R.div(null, Card(card));
        }
    }));

    return {
        Home: Home,
        Deck: Deck,
        Study: Study
    };
});