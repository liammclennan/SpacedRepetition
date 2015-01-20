define('urls', [], function () {

    return {
        encodeForPath: function (url) {
            return encodeURIComponent(btoa(url));
        },
        decodeForPath: function (encodedUrl) {
            return atob(decodeURIComponent(encodedUrl));
        }
    };

});