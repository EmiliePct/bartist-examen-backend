// checkBody() qui recevra un objet contenant le body renvoyé par les formulaires d’inputs et un tableau des champs à tester. Si chaque élément de celui-ci existe et que le nombre d’éléments est le bon, la fonction renverra true et sinon false.

function checkBody(keys, value) {
    let checkIsOk = true;

    for (const iterator of value) {
        console.log(iterator)
        if(!keys[iterator] || keys[iterator] === ""){
            checkIsOk = false;
        }
    }
    return checkIsOk;
}

module.exports = { checkBody };