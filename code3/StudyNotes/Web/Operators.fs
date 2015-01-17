module Operators

let (?) (parameters:obj) param =
    (parameters :?> Nancy.DynamicDictionary).[param]
