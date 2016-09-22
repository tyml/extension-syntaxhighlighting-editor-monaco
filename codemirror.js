///<reference path='./node_modules/@types/codemirror/index.d.ts'/>
define(["require", "exports"], function (require, exports) {
    "use strict";
    var TymlTmpState = (function () {
        function TymlTmpState() {
            this.nextTokens = [];
            this.state = null;
        }
        TymlTmpState.prototype.getNext = function (stream) {
            while (this.nextTokens.length > 0) {
                var token = this.nextTokens.shift();
                var i = token.Length;
                if (i == 0)
                    continue;
                while (i-- > 0)
                    if (stream.next() === null)
                        continue;
                return tokenMap[Tyml.TymlTokenType[token.Type]];
            }
            {
                var ref = new NReference(this.state);
                this.nextTokens = Tyml.TymlTokenizer.ReadTokens(stream.string.substr(stream.pos) + "\n", ref, false).ToArray();
                this.state = ref.val;
            }
            var tmpToken = this.nextTokens.pop(); // ignore newline
            this.nextTokens.push(new Tyml.TymlToken(tmpToken.Length - 1, tmpToken.Type));
            //console.log(`Read '${stream.string}'`, this.state, "tokens: "+this.nextTokens);
            if (this.nextTokens.length > 0)
                return this.getNext(stream);
            else {
                // console.log(`reading ${stream.string} yielded ${this.nextTokens.length} tokens`);
                // not a single token on the line, mark as invalid
                stream.skipToEnd();
                return "notparsed";
            }
        };
        return TymlTmpState;
    }());
    var TymlHighlight = (function () {
        function TymlHighlight(config, modeOptions) {
            return this;
        }
        TymlHighlight.prototype.token = function (stream, state) {
            //console.log(`called token with ${stream.string} at ${stream.pos}`);
            return state.getNext(stream);
        };
        TymlHighlight.prototype.startState = function () {
            return new TymlTmpState();
        };
        TymlHighlight.prototype.copyState = function (s) {
            return Object.clone(s, true);
        };
        return TymlHighlight;
    }());
    exports.TymlHighlight = TymlHighlight;
    CodeMirror.defineMode("tyml", function (a, b) { return new TymlHighlight(a, b); });
});
