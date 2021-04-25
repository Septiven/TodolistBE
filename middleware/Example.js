const example = (req, res, next) => {
    console.log('Middleware')
    next()
}

module.exports = example