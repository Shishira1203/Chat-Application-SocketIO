const generateMessage = (username,text) => {
    return {
        username,
        text,
        createdAt: Date.now()
    }
}

const generateLocationMessage = (username,url) => {
    return {
        username,
        url,
        createdAt: Date.now()
    }
}

module.exports = {generateMessage,generateLocationMessage}