class json2dom {

    constructor(json) {

        this.id = 0;
        this.instances = 0;
        this.instances += 1;

    }
    _run(json) {

        return this._block(this._type(json, 0, false), {});

    }
    _id() {

        return this.instances + '_' + this.id++;

    };

    _type(value, depth, indent) {

        let type = typeof value;
        if (type !== 'object') {
            return this._strType(value, indent ? depth : 0);
        } else if (value instanceof Array) {
            return this._arrType(value, depth, indent);
        } else {
            return this._objType(value, depth, indent);
        }

    };

    _objType(object, depth, indent) {

        let id = this._id();
        let attrs = {
            id: id
        };
        let content = Object.keys(object)
            .map(key => this._key(key, object[key], depth + 1, true))
            .join('\n');

        let body = [
            this._openBr('{', indent ? depth : 0, id), 
            this._block(content, attrs), 
            this._closeBr('}', depth)
        ].join('\n');
        return this._block(body, {});

    };

    _arrType(array, depth, indent) {

        let id = this._id();
        let attrs = {
            id: id
        };
        let body = array.map(element => this._type(element, depth + 1, true))
            .join('\n');
        let arr = [
            this._openBr('[', indent ? depth : 0, id), 
            this._block(body, attrs), 
            this._closeBr(']', depth)
        ].join('\n');
        return arr;

    };

    _strType(value, depth) {

        let jsonString = JSON.stringify(value);
        return this._block(this._indent(jsonString.replace(/<\/?[^>]+(>|$)/g, ""), depth), {
            class: 'value'
        });

    };

    _key(name, value, depth) {

        let key = this._indent(JSON.stringify(name) + ': ', depth);
        let keyValue = this._block(this._type(value, depth, false), {});
        return this._block(key + keyValue, { class: 'key'});

    };


    _block(value, attrs) {

        return '<span' + Object.keys(attrs).map(attr=> ' ' + attr + '="' + attrs[attr] + '"')
            .join('') + '>' +
            value +
            '</span>';

    };


    _openBr(symbol, depth, id) {

        return (
            this._block(this._indent(symbol, depth), {
                class: 'value'
            }) +
            this._block('', {
                class: "close"
                , onclick: 'json2dom.toggle(\'' + id + '\')'
            })
        );

    };

    static toggle(id) {

        let element = document.getElementById(id);
        let parent = element.parentNode;
        let Button = element.previousElementSibling;
        if (element.className === '') {
            element.className = 'hidden';
            parent.className = 'closed';
            Button.className = 'open';
        } else {
            element.className = '';
            parent.className = '';
            Button.className = 'close';
        }

    };

    _closeBr(symbol, depth) {

        return this._block(this._indent(symbol, depth), {});

    };

    _indent(value, depth) {

        return Array((depth * 2) + 1).join(' ') + value;

    };


};

var data = new json2dom();
fetch('http://json', {
        method: 'GET'
    , })
    .then(response => response.json())
    .then(json => {
        document.body.innerHTML += data._run(json);
    })