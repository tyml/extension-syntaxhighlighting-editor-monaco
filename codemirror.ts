
///<reference path='./node_modules/@types/codemirror/index.d.ts'/>


class TymlTmpState {
    nextTokens:Tyml.TymlToken[] = [];
    state: Tyml.TymlTokenizerState = null;
    getNext(stream: CodeMirror.StringStream): string {
        while (this.nextTokens.length > 0) {
            let token = this.nextTokens.shift();
            let i = token.Length;
            if (i == 0) continue;
            while (i-- > 0) if(stream.next() === null) continue;
            return tokenMap[Tyml.TymlTokenType[token.Type]];
        }
        
        {
            let ref = new NReference(this.state);
            this.nextTokens = Tyml.TymlTokenizer.ReadTokens(stream.string.substr(stream.pos)+"\n", ref, false).ToArray();
            this.state = ref.val;
        }
        let tmpToken = this.nextTokens.pop(); // ignore newline
        this.nextTokens.push(new Tyml.TymlToken(tmpToken.Length-1, tmpToken.Type));

        //console.log(`Read '${stream.string}'`, this.state, "tokens: "+this.nextTokens);
        if (this.nextTokens.length > 0) return this.getNext(stream);
        else {
            // console.log(`reading ${stream.string} yielded ${this.nextTokens.length} tokens`);
            // not a single token on the line, mark as invalid
            stream.skipToEnd();
            return "notparsed";
        }
    }
}

export class TymlHighlight implements CodeMirror.Mode<TymlTmpState> {
    constructor(config: CodeMirror.EditorConfiguration, modeOptions?: any) {
        return this;
    }
    token(stream: CodeMirror.StringStream, state: TymlTmpState) {
        //console.log(`called token with ${stream.string} at ${stream.pos}`);
        return state.getNext(stream);
    }
    startState() {
        return new TymlTmpState();
    }
    copyState(s:TymlTmpState) {
        return (<any>Object).clone(s, true);
    }
}

CodeMirror.defineMode("tyml", (a, b) => new TymlHighlight(a, b));