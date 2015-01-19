define('components', ['euclid'], function (euclid) {
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
    var Home = React.createFactory(React.createClass({
        getInitialState: function () {
            return { importUrl: '' };
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
                        R.button(null, 'Return to Wiki'))));
        },
        'import': function (e) {
            e.preventDefault();
            euclid.action('importWiki', this.state.importUrl);
        },
        mixins: [formMixin]
    }));

    var Import = React.createFactory(React.createClass({
        render: function () {
            console.dir(this.props);
            return React.DOM.p(null, 'This is the import component');
        }
    }));

    return {
        Home: Home,
        Import: Import
    };
});