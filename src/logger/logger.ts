const getTimeStamp = (): string => {
    return new Date().toISOString();
}

const debug = (filename:string, message:string, object?: any) => {
    if(object) {
        console.log(`[${getTimeStamp()}] [DEBUG] [${filename}] ${message}`, object);
    }
    else {
        console.log(`[${getTimeStamp()}] [DEBUG] [${filename}] ${message}`);
    }
}

const info = (filename:string, message:string, object?: any) => {
    if(object) {
        console.log(`[${getTimeStamp()}] [INFO] [${filename}] ${message}`, object);
    }
    else {
        console.log(`[${getTimeStamp()}] [INFO] [${filename}] ${message}`);
    }
}

const warn = (filename:string, message:string, object?: any) => {
    if(object) {
        console.log(`[${getTimeStamp()}] [WARN] [${filename}] ${message}`, object);
    }
    else {
        console.log(`[${getTimeStamp()}] [WARN] [${filename}] ${message}`);
    }
}

const error = (filename:string, message:string, object?: any) => {
    if(object) {
        console.log(`[${getTimeStamp()}] [ERROR] [${filename}] ${message}`, object);
    }
    else {
        console.log(`[${getTimeStamp()}] [ERROR] [${filename}] ${message}`);
    }
}


export default {
    debug,
    info,
    warn,
    error
};