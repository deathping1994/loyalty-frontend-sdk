const injectVariablesToHTML = (htmlTemplate, selector, variable) => {
    //To inject variables in an HTML template(in memory) without making manipulations to the actual DOM
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = htmlTemplate;
    tempContainer.querySelector(selector).innerHTML = `${variable}`;
    return tempContainer.innerHTML
}

module.exports = {
    injectVariablesToHTML,
};