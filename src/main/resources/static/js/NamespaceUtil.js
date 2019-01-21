(function() {

    pa = window.pa || {};
    pa.ns = ns;
    pa.define = define;

    pa.NamespaceUtil = {
        ns: ns,
        define: define
    };

    function ns(namespace) {
        let currentNode, names, newNode;

        currentNode = window;
        names = namespace.split('.');

        names.forEach(function(name, index) {
            newNode = currentNode[name];

            if (newNode && index < (names.length - 1) && typeof newNode !== 'object') {
                throw Error(`property ${name} in ${namespace} already exist but is not an object, so it's impossible to define the namespace`);
            } else if (!newNode) {
                newNode = {};
                currentNode[name] = newNode;
            }

            currentNode = newNode;
        });

        return currentNode;
    }

    function define(fullNamespace, object) {
        let className, lastDotIndex, namespaceObject;

        lastDotIndex = fullNamespace.lastIndexOf('.');
        namespaceObject = ns(fullNamespace.substring(0, lastDotIndex));
        className = fullNamespace.substring(lastDotIndex + 1, fullNamespace.length);

        if (namespaceObject[className]) {
            throw new Error(`${fullNamespace} already exists.`);
        }

        return namespaceObject[className] = object;
    }
})();
