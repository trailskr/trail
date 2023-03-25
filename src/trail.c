typedef struct Str_ {
    int _len;
    char* _str;
} Str;

Str StrNew() {
}

typedef struct Logger_ {
    void (*_logFn)(Str str);
    Str _tab;
} Logger;

Logger LoggerNew(
    void (*logFn)(Str str),
    Str tab,
    int maxPrintLines) {
    Logger logger = {
        ._logFn = logFn,
        ._tab = tab};
    return logger;
}

void main() {
    Logger logger;
    logger._tab;
}
