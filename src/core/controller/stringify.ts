
export function STRINGIFY(input:any) {
    return _STRINGIFY(input);
}

function _STRINGIFY(input:any) : string {
    if(input === null || input === undefined) {
        return "{}";
    }

    switch(typeof input) {
        case 'boolean':
            return _STRINGIFYBOOLEAN(input);
        case 'number':
            return _STRINGIFYNUMBER(input);
        case 'string':
            return _STRINGIFYSTRING(input);
        case 'object':
            if(Array.isArray(input)) {
                return _STRINGIFYARRAY(input);
            } else if (Object.prototype.toString.call(input) === '[object Date]') {
                return _STRINGIFYDATE(input);
            } else {
                return _STRINGIFYOBJECT(input);
            }
        default:
            //Something weird
            return "{weird}";
    }
}

function _STRINGIFYBOOLEAN(input:boolean) :string {
    return input ? "true" : "false";
}
function _STRINGIFYNUMBER(input:number) :string {
    return input + "";
}
function _STRINGIFYSTRING(input:string) :string {
    return input + "";
}
function _STRINGIFYARRAY(input:any[]) :string {
    let output = "[";
    input.forEach((s, i) => {
        let res = _STRINGIFY(s);
        if(i !== input.length - 1) {
            res += ","
        }
        output += res;
    });
    output += "]";
    return output;
}
function _STRINGIFYDATE(input:Date) :string {
    return "" + input.toString();
}
function _STRINGIFYOBJECT(input:any) :string {
    let output = "{";
    let keys = Object.keys(input).sort();
    keys.forEach((key, i) => {
        let res = '"' + key +'":';
        res += _STRINGIFY(input[key])
        if(i !== keys.length - 1) {
            res += ","
        }
        output += res;
    });
    output += "}"
    return output;
}