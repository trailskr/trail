import { Opt } from "src/opt";
import { CodePtr } from "./code-ptr";

export interface CharParser {
    parse(codePtr: CodePtr): [newCodePtr: CodePtr, char: Opt<char>]
}