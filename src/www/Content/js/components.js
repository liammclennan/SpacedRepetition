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

    var Deck = React.createFactory(React.createClass({
        render: function () {
            console.dir(this.props);
            return R.div(null, 
                R.h1(null, this.props.name),
                R.button(null, 'Sync Now'),
                R.p(null, this.props.sourceUrl + 'cat'));
        }
    }));

    return {
        Home: Home,
        Deck: Deck
    };
});