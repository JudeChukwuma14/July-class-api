


const extractPublicIdFromUrl = (url) => {
    const splitUrl = url.split('/upload/')

    if (splitUrl.length > 1) {
        let path = splitUrl[1]
        if (path.match(/^v\d+\//)) {
            path = path.replace(/^v\d+\//, '');
        }
        path = path.substring(0, path.lastIndexOf('.'));
        return path;
    }
    return null
}

module.exports = extractPublicIdFromUrl 
