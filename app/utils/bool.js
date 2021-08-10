// https://stackoverflow.com/questions/263965/how-can-i-convert-a-string-to-boolean-in-javascript

const falsy = /^(?:f(?:alse)?|no?|0+)$/i;
const parse = function(val) { 
    return !falsy.test(val) && !!val;
};
const bool = {
  parse
};

export default bool;