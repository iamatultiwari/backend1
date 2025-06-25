class apiError extends Error {
    constructor (
        statusCode,
        message="Somethimg went error",
        errors =[],
        stack =""
        
    )
    {
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false;
        this.errors = this.errors
        
        
        if(stack) {
            this.satck = stack
        }else {
            Error.captureStackTrace(this,this.constructor)
        }


    }
}

export {Apierror}